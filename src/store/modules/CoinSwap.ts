import Mutex from 'await-mutex';
import {promises as fs} from 'fs';
import {cloneDeep} from 'lodash';
import path from "path";
import {CoinSwapApiWrapper, Provider, OrderId, Ticker, OrderStatus, Address, Timestamp, TransactionId} from "../../lib/coinswap";
import keys from "../../keys";

const coinSwapApi = new CoinSwapApiWrapper(keys);

// Used to synchronise access to on-disk state.
const coinSwapFileLock = new Mutex();

// a whole coin amount of a given coin, e.g. "1.08" FIRO = 1.08e8 FIRO satoshi
type StrAmount = string;

interface CoinSwapRecord {
    // Data in this section will be populated ourselves when the order is created.
    //
    // the status of the order
    status: OrderStatus,
    // the name of the chain that the order is made
    chainName: Provider,
    // a UUID representing the order
    orderId: OrderId,
    // the currency code for the coin to be sent to the exchange
    fromCoin: Ticker,
    // the currency code for the coin to be received from the exchange
    toCoin: Ticker,
    // the exact amount of ${fromCoin} that should be sent
    sendAmount: StrAmount,
    // the expect amount of ${toCoin} to receive; this may not be exactly accurate
    expectedAmountToReceive: StrAmount,
    // when the order is made, 1 ${fromCoin} is expected to be equal to ${expectedRate} ${toCoin}; this does not take
    // fees into account and may not be exactly accurate
    expectedRate: StrAmount,
    // the amount of FIRO that we sent as a fee; if ${fromCoin != 'FIRO'} this will be undefined
    fromFee?: StrAmount,
    // the expected amount of ${toCoin} that the exchange used as a fee; this will always be defined
    expectedToFee: StrAmount,
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
    actualAmountToReceive?: StrAmount,

    // Data in this section will be populated from an API reply when status changes to 'confirmed'
    //
    // The ID of the transaction to receiveAddress that leaves the exchange.
    outputTxId?: TransactionId,

    // Data in this section will be populated from an API reprly when status changes to 'refunded'
    //
    // The ID of the refund transaction on ${fromCoin}'s blockchain, if the transaction failed.
    refundTx?: TransactionId,
}

const state = {
    records: <{[orderId: string]: CoinSwapRecord}>{},
};

const mutations = {
    updateCoinSwapRecords(state: { records: object; }, records: CoinSwapRecord[]) {
        for (const record of records) {
            state.records[record.orderId] = record;
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
            console.error(`Failed to read CoinSwap data: ${err}`);
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
                    console.error(`Failed to parse CoinSwap record: ${r}`)
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
            console.error(`Failed to open CoinSwap file: ${err}`);
            throw err;
        }

        const data = records.map(r => JSON.stringify(r)).join('\n') + '\n';

        try {
            await handle.write(data, null, 'utf8');
        } catch (err) {
            console.error(`Failed to write CoinSwap records ${data}: ${err}`);
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
            console.debug(`Fetching status for CoinSwap record ${record.orderId}...`);

            let orderStatus;
            try {
                orderStatus = await coinSwapApi.getOrderStatus(record.chainName, record.orderId);
            } catch(e) {
                console.error(`Failed to fetch status for CoinSwap record ${record.orderId}: ${e}`);
                return;
            }

            if (orderStatus.status !== record.status) {
                console.info(`Updating status of CoinSwap record ${record.orderId} to '${orderStatus.status}'...`);

                return {
                    ...record,
                    status: orderStatus.status,
                    receivedAt: orderStatus.receivedAt,
                    depositTxId: orderStatus.fromTxId,
                    refundTx: orderStatus.refundTxId,
                    outputTxId: orderStatus.toTxId
                };
            }
        });

        const recordsToUpdate = (await Promise.all(updatePromises))
            .filter(x=>x);
        if (!recordsToUpdate.length) return;

        await dispatch('addOrUpdateRecords', recordsToUpdate);
    }
};

const getters = {
    coinSwapFileLocation: (state, getters, rootState, rootGetters) => process.env.FIRO_CLIENT_TEST ?
        path.join(process.cwd(), 'coin-swap-test.jsonl')
        :
        path.join(rootGetters['App/userDataPath'], 'coin-swap.jsonl'),

    records: (state: { records: any; }) => state.records
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};