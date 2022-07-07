import Vue from 'vue';
import Mutex from 'await-mutex';
import {promises as fs} from 'fs';
import {cloneDeep} from 'lodash';
import path from "path";
import {getApp} from '../../lib/utils';
import ChangeAPIWorker from '../../lib/changenow-api';
import {createLogger} from '../../lib/logger';
const logger = createLogger('firo:store:CoinSwap');

// Used to communicate with the CoinSwap API.

const apiWorker = new ChangeAPIWorker();
// Used to synchronise access to on-disk state.
const coinSwapFileLock = new Mutex();

// a chain name associated with an order
type ChainName = string;
// a unique identifier associated with an order
type OrderId = string;
// e.g. "FIRO", "USDT", "BTC", "BCHABC", etc.
type CurrencyCode = string;
// a whole coin amount of a given coin, e.g. "1.08" FIRO = 1.08e8 FIRO satoshi
type Amount = string;
// the status of the request; this will be updated from 'waiting' to some other value, and then not again.
type CoinSwapStatus = 'waiting' | 'expired' | 'received' | 'confirming' | 'exchanging' | 'confirmed' |'finished' | 'refunded' | 'failed';
// a UNIX timestamp
type Timestamp = number;
// a coin address, of any type of coin
type Address = string;
// a transaction ID, from any coin
type TransactionId = string;

interface CoinSwapRecord {
    // Data in this section will be populated ourselves when the order is created.
    //
    // the status of the order
    status: CoinSwapStatus,
    // the name of the chain that the order is made
    chainName: ChainName,
    // a UUID representing the order
    orderId: OrderId,
    // the currency code for the coin to be sent to the exchange
    fromCoin: CurrencyCode,
    // the currency code for the coin to be received from the exchange
    toCoin: CurrencyCode,
    // the exact amount of ${fromCoin} that should be sent
    sendAmount: Amount,
    // the expect amount of ${toCoin} to receive; this may not be exactly accurate
    expectedAmountToReceive: Amount,
    // when the order is made, 1 ${fromCoin} is expected to be equal to ${expectedRate} ${toCoin}; this does not take
    // fees into account and may not be exactly accurate
    expectedRate: Amount,
    // the amount of FIRO that we sent as a fee; if ${fromCoin != 'FIRO'} this will be undefined
    fromFee?: Amount,
    // the expected amount of ${toCoin} that the exchange used as a fee; this will always be defined
    expectedToFee: Amount,
    // the time at which the order was made (not fulfilled)
    date: Timestamp,
    // the ${toCoin} address that excess funds will be refunded to
    refundAddress: Address,
    // the ${toCoin} address of the exchange
    exchangeAddress: Address,
    // the ${fromCoin} address that funds will be received at
    receiveAddress: Address,


    // Data in this section will be populated from an API reply when status changes to 'received'
    //
    // The timestamp that the outgoing transaction was received at.
    receivedAt?: Timestamp,
    // The transaction ID of the deposit transaction
    depositTxId?: TransactionId,

    // Data in this section will be populated from an API reply when status changes to 'confirming'
    //
    // The actual amount that will be received.
    actualAmountToReceive?: Amount,

    // Data in this section will be populated from an API reply when status changes to 'confirmed'
    //
    // The ID of the transaction to receiveAddress that leaves the exchange.
    outputTxId?: TransactionId,

    // Data in this section will be populated from an API reprly when status changes to 'refunded'
    //
    // The ID of the refund transaction on ${fromCoin}'s blockchain, if the transaction failed.
    refundTx?: TransactionId,

    // This is the latest response from the API. We only keep the latest one because previous ones will be logged
    // anyway.
    _response: object
}

const state = {
    records: <{[orderId: string]: CoinSwapRecord}>{},
};

const mutations = {
    updateCoinSwapRecords(state: { records: object; }, records: CoinSwapRecord[]) {
        for (const record of records) {
            Vue.set(state.records, record.orderId, record);
        }
    }
};

// The JSONL format is used for storage due to it being less prone to destroying old data than plain JSON.
const actions = {
    // This is called on startup in renderer.js.
    async readRecordsFromFile({getters, commit}): Promise<void> {
        const release = await coinSwapFileLock.lock();

        let data: string;
        try {
            data = (await fs.readFile(getters.coinSwapFileLocation, {encoding: 'utf8'})).toString();
        } catch (err) {
            if (err.code === 'ENOENT') return;
            logger.error(`Failed to read CoinSwap data: ${err}`);
            throw err;
        } finally {
            release();
        }

        window['data'] = data;

        const records = data
            .split('\n')
            .map((r: string) => {
                // The last value will always be empty.
                if (!r) return undefined;

                // We do this so that a corrupted line doesn't render CoinSwap permanently unusable
                try {
                    return JSON.parse(r);
                } catch {
                    logger.error(`Failed to parse CoinSwap record: ${r}`)
                    return undefined;
                }
            })
            .filter((r: any) => !!r);
        commit('updateCoinSwapRecords', records);
    },

    async writeRecordsToFile({getters}, records: CoinSwapRecord[]): Promise<void> {
        if (!records.length) return;

        const release = await coinSwapFileLock.lock();

        let handle: fs.FileHandle;
        try {
            handle = await fs.open(getters.coinSwapFileLocation, 'a');
        } catch (err) {
            release();
            logger.error(`Failed to open CoinSwap file: ${err}`);
            throw err;
        }

        const data = records.map(r => JSON.stringify(r)).join('\n') + '\n';

        try {
            await handle.write(data, null, 'utf8');
        } catch (err) {
            logger.error(`Failed to write CoinSwap records ${data}: ${err}`);
            throw err;
        } finally {
            await handle.close();
            release();
        }
    },

    async addOrUpdateRecords({dispatch, commit}, records: CoinSwapRecord[]): Promise<void> {
        await dispatch('writeRecordsToFile', records);

        commit('updateCoinSwapRecords', records);
    },

    // This is called every minute by renderer.js.
    async updateOutdatedRecords({getters, dispatch}): Promise<void> {
        const potentiallyOutdatedRecords = (<CoinSwapRecord[]>Object.values(getters.records))
            .filter(record =>
                !['expired', 'confirmed', 'refunded', 'failed', 'finished'].includes(record.status) ||
                // Despite failed and expired being documented as permanent states in the Switchain API docs, they can
                // in fact be updated. Therefore we check for updates for 24 hours after they're made.
                (['failed', 'expired'].includes(record.status) && record.date > Date.now() - 60e3 * 60 * 24)
            );

        const updatePromises = potentiallyOutdatedRecords.map(async (record): Promise<CoinSwapRecord | undefined> => {
            logger.debug(`Fetching status for CoinSwap record ${record.orderId}...`);

            try {
                const {error, response} = await apiWorker.getOrderStatus(record);
                
                if (error) throw error;
                if (response.status !== record.status) {
                    logger.info(`Updating status of CoinSwap record ${record.orderId} to '${response.status}...`);

                    const newRecord = cloneDeep(record);

                    newRecord.status = response.status;

                    // This just logs the response to disk for debugging purposes.
                    newRecord._response = response;

                    // Update our records with new data.
                    if (response.createdAt)
                        newRecord.receivedAt = Math.floor(+new Date(response.createdAt) / 1000);
                    if (response.depositTxId)
                        newRecord.depositTxId = response.depositTxId;
                    if (response.refundTx)
                        newRecord.refundTx = response.refundTx;
                    if (response.rate)
                        // So response.rate is mislabelled, and does not contain the actual rate, but the amount that
                        // was sent out. Therefore we need to calculate the actual rate ourselves.
                        // newRecord.actualAmountToReceive = response.rate;
                    if (response.toTx)
                        newRecord.outputTxId = response.toTx;

                    return newRecord;
                }
            } catch(e) {
                logger.error(`Failed to fetch status for CoinSwap record ${record.orderId}: ${e}`);
            }
        });

        const recordsToUpdate = (await Promise.all(updatePromises))
            .filter(x=>x);
        if (!recordsToUpdate.length) return;

        await dispatch('addOrUpdateRecords', recordsToUpdate);
    }
};

const getters = {
    coinSwapFileLocation: () => process.env.FIRO_CLIENT_TEST ?
        path.join(process.cwd(), 'coin-swap-test.jsonl')
        :
        path.join(getApp().getPath('userData'), 'coin-swap.jsonl'),

    records: (state: { records: any; }) => state.records
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};