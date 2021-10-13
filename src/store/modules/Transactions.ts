import {Transaction, TxOut, CoinControl} from '../../daemon/firod';
import Vue from "vue";
import {cloneDeep, fromPairs} from "lodash";

export interface TXO extends TxOut {
    blockHash?: string;
    blockHeight?: number;
    blockTime?: number;
    isInstantSendLocked: boolean;

    txid: string;
    index: number;
    // This indicates whether this input should be used for new private transactions.
    isPrivate: boolean;
    // This indicates whether the transaction as a whole was private.
    inputPrivacy: 'public' | 'zerocoin' | 'sigma' | 'lelantus' | 'mined';
    validAt: number;
    firstSeenAt: number;
    isFromMe: boolean;
    fee: number;
    spendSize?: number; // undefined if unknown
}

function txosFromTx(tx: Transaction): TXO[] {
    const txos: TXO[] = [];

    let index = -1;
    for (const txout of tx.outputs) {
        index += 1;

        // This is for txouts of multi-recipient transactions that we've received funds from that go to other wallets.
        if (!tx.isFromMe && !txout.isToMe) continue;

        let spendSize = undefined;
        switch (txout.scriptType) {
            case "lelantus-mint":
            case "lelantus-jmint":
            case "lelantus-joinsplit":
            case "sigma-mint":
            case "sigma-spend":
                spendSize = 2560;
                break;

            case "pay-to-public-key":
                spendSize = 114;
                break;

            case "pay-to-public-key-hash":
            case "pay-to-script-hash":
                spendSize = 148;
                break;

            default:
                console.warn(`${tx.txid}-${index} has an unknown scriptType`);
        }

        const isPrivate = ['lelantus-mint', 'lelantus-jmint', 'sigma-mint'].includes(txout.scriptType)

        let validAt = Infinity;
        if (!tx.blockHeight) validAt = Infinity;
        else if (tx.inputType == "mined") validAt = tx.blockHeight + 101;
        else if (tx.inputType == 'sigma') validAt = tx.blockHeight + 6;
        else if (tx.inputType == 'lelantus') validAt = tx.blockHeight + 1;
        else if (isPrivate) validAt = tx.blockHeight + 1;
        else if (tx.inputType == 'public' && !isPrivate) validAt = 0;

        txos.push({
            blockHash: tx.blockHash,
            blockHeight: tx.blockHeight,
            blockTime: tx.blockTime,
            txid: tx.txid,
            index,
            isPrivate,
            inputPrivacy: tx.inputType,
            isFromMe: tx.isFromMe,
            validAt,
            firstSeenAt: tx.firstSeenAt,
            spendSize,
            fee: tx.fee,
            isInstantSendLocked: tx.isInstantSendLocked,
            ...txout
        });
    }

    return txos;
}

const state = {
    transactions: <{[txid: string]: Transaction}>{}
};

let upcomingTransactions: {[txid: string]: Transaction} = {};
let upcomingTransactionsLastUpdated = Infinity;
let ticker;

const mutations = {
    setWalletState(state, walletState: Transaction[]) {
        for (const tx of walletState) {
            upcomingTransactions[tx.txid] = tx;
        }
        upcomingTransactionsLastUpdated = Date.now();

        if (!ticker) {
            console.log('updating transaction data');
            state.transactions = cloneDeep(upcomingTransactions)
            upcomingTransactionsLastUpdated = Infinity;
            ticker = setInterval(() => {
                if (upcomingTransactionsLastUpdated > Date.now() - 1000) return;
                console.log('updating transaction data');
                upcomingTransactionsLastUpdated = Infinity;
                state.transactions = cloneDeep(upcomingTransactions);
            }, 500);
        }
    },

    markSpentTransaction(state, inputs: CoinControl) {
        for (const input of inputs) {
            upcomingTransactions[input[0]].outputs[input[1]].isSpent = true;
            upcomingTransactionsLastUpdated = Date.now();
        }
    }
};

function selectUTXOs(isPrivate: boolean, amount: number, feePerKb: number, subtractFeeFromAmount: boolean, availableUTXOs: TXO[], coinControl: boolean): [number, TXO[]] {
    const constantSize = isPrivate ? 1234 : 78;

    if (coinControl) {
        if (availableUTXOs.find(utxo => utxo.isPrivate != isPrivate)) return undefined;

        // assume 5000 as the signature size for unknown outputs.
        const totalSize = constantSize + availableUTXOs.reduce((a, utxo) => a + utxo.spendSize || 5000, 0);
        const gathered = availableUTXOs.reduce((a, utxo) => a + utxo.amount, 0);

        let fee = Math.floor(totalSize / 1000 * feePerKb);
        if (fee === 0) fee = 1;

        if (subtractFeeFromAmount && fee >= amount) return undefined;
        if (gathered < (subtractFeeFromAmount ? amount : amount + fee)) {
            return undefined;
        }

        return [fee, availableUTXOs];
    }

    const utxos = availableUTXOs
        .filter(utxo => utxo.isPrivate == isPrivate)
        .sort((a, b) => b.amount - a.amount);

    let totalSize = constantSize;
    let gathered = 0;

    const selectedUTXOs = [];
    for (const utxo of utxos) {
        gathered += utxo.amount;
        totalSize += utxo.spendSize;
        selectedUTXOs.push(utxo);

        let fee = Math.floor(totalSize / 1000 * feePerKb);
        if (fee === 0) fee = 1;

        if (subtractFeeFromAmount && amount <= fee) continue;
        if (gathered >= (subtractFeeFromAmount ? amount : amount + fee)) {
            return [fee, selectedUTXOs];
        }
    }

    return undefined;
}

const getters = {
    transactions: (state): {[txid: string]: Transaction} => state.transactions,
    TXOs: (state, getters): TXO[] => (<Transaction[]>Object.values(getters.transactions))
        .reduce((a: TXO[], tx: Transaction): TXO[] => a.concat(txosFromTx(tx)), [])
        // Don't display orphaned mining transactions.
        .filter(txo => !(txo.blockHash && !txo.blockHeight && txo.inputPrivacy === 'mined')),
    TXOMap: (state, getters): {[txidIndex: string]: TXO} => fromPairs(getters.TXOs.map(txo => [`${txo.txid}-${txo.index}`, txo])),
    UTXOs: (state, getters): TXO[] => getters.TXOs.filter((txo: TXO) => !txo.isSpent),
    availableUTXOs: (state, getters, rootState, rootGetters): TXO[] => getters.UTXOs.filter((txo: TXO) =>
        txo.isToMe &&
        (rootGetters['App/allowBreakingMasternodes'] || !txo.isLocked) &&
        txo.validAt <= rootGetters['ApiStatus/currentBlockHeight'] + 1
    ),

    userVisibleTransactions: (state, getters): TXO[] => getters.TXOs
        .filter((txo: TXO) => !txo.isChange && txo.destination)
        .sort((a, b) => b.firstSeenAt - a.firstSeenAt),

    selectInputs: (state, getters): (isPrivate: boolean, amount: number, feePerKb: number, subtractFeeFromAmount: boolean) => CoinControl => {
        getters.availableUTXOs;
        return (isPrivate: boolean, amount: number, feePerKb: number, subtractFeeFromAmount: boolean): CoinControl => {
            return selectUTXOs(isPrivate, amount, feePerKb, subtractFeeFromAmount, getters.availableUTXOs, false)[1].map(utxo => [utxo.txid, utxo.index]);
        }
    },

    calculateTransactionFee: (state, getters): (isPrivate: boolean, amount: number, feePerKb: number, subtractFeeFromAmount: boolean, coinControl?: TXO[]) => number => {
        getters.availableUTXOs;
        return (isPrivate: boolean, amount: number, feePerKb: number, subtractFeeFromAmount: boolean, coinControl?: TXO[]): number => {
            const x = selectUTXOs(isPrivate, amount, feePerKb, subtractFeeFromAmount, coinControl ? coinControl : getters.availableUTXOs, !!coinControl);
            return x && x[0];
        };
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    getters
};
