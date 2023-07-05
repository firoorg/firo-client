import {Transaction, TxOut, CoinControl, ElysiumData} from '../../daemon/firod';
import {cloneDeep, fromPairs} from "lodash";

export interface TXO extends TxOut {
    blockHash?: string;
    blockHeight?: number;
    blockTime?: number;
    isInstantSendLocked: boolean;
    publicInputs: CoinControl;

    txid: string;
    index: number;
    // This indicates whether the TXO was spent AT THE TIME IT WAS SENT. If we have sent a transaction using it as an
    // input after that, it will still be false. You therefore need to additionally check against our spentSerialHashes
    // and spentPublicInputs getters to determine whether the TXO has actually been spent.
    isSpent: boolean;
    // This indicates whether this input should be used for new private transactions.
    isPrivate: boolean;
    // This indicates whether the transaction as a whole was private.
    inputPrivacy: 'public' | 'zerocoin' | 'sigma' | 'lelantus' | 'mined' | 'sparkmint' | 'sparkspend';
    validAt: number;
    firstSeenAt: number;
    isFromMe: boolean;
    fee: bigint;
    spendSize?: number; // undefined if unknown
    elysium?: ElysiumData;
    lelantusInputSerialHashes?: string[];
}

function txosFromTx(tx: Transaction, spentLTagHashes: Set<string>, spentSerialHashes: Set<string>, spentPublicInputs: Set<string>): TXO[] {
    const txos: TXO[] = [];

    let index = -1;
    for (const txout of tx.outputs) {
        index += 1;

        // This is for txouts of multi-recipient transactions that we've received funds from that go to other wallets.
        if (!tx.isFromMe && !txout.isToMe && !tx.elysium.isToMe) continue;

        let spendSize = undefined;
        switch (txout.scriptType) {
            case "spark-mint":
            case "spark-smint":
            case "spark-spend":
                spendSize = 2535;
                break;
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

            case "pay-to-witness-script-hash":
            case "zerocoin-mint":
            case "zerocoin-remint":
            case "zerocoin-spend":
            case "elysium":
                break;

            default:
                console.warn(`${tx.txid}-${index} has an unknown scriptType`);
        }

        const isPrivate = ['lelantus-mint', 'lelantus-jmint', 'sigma-mint', "spark-mint", "spark-smint"].includes(txout.scriptType)

        let validAt = Infinity;
        if (!tx.blockHeight && !tx.isInstantSendLocked) validAt = Infinity;
        else if (tx.inputType == "mined") validAt = tx.blockHeight + 101;
        else if (!isPrivate) validAt = 0;
        else if (isPrivate && tx.blockHeight) validAt = tx.blockHeight + 1;

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
            elysium: tx.elysium,
            publicInputs: tx.publicInputs,
            lelantusInputSerialHashes: (<any>tx).lelantusInputSerialHashes,
            sparkInputLTagHashes: (<any>tx).sparkInputLTagHashes,
            isSpent: txout.isSpent || (isPrivate ? (["spark-mint", "spark-smint"].includes(txout.scriptType) ? spentLTagHashes.has(txout.sparkInputLTagHashes) : spentSerialHashes.has(txout.lelantusSerialHash)) : spentPublicInputs.has(`${tx.txid}-${index}`)),
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
        if (!Object.keys(upcomingTransactions).length) {
            console.debug('resetting upcomingTransactions');
            upcomingTransactions = cloneDeep(state.transactions);
        }

        for (const tx of walletState) {
            upcomingTransactions[tx.txid] = tx;
        }
        upcomingTransactionsLastUpdated = Date.now();

        if (!ticker) {
            console.debug('updating transaction data');
            state.transactions = cloneDeep(upcomingTransactions)
            upcomingTransactionsLastUpdated = Infinity;
            ticker = setInterval(() => {
                if (upcomingTransactionsLastUpdated > Date.now() - 1000) return;
                console.debug('updating transaction data');
                upcomingTransactionsLastUpdated = Infinity;
                state.transactions = cloneDeep(upcomingTransactions);
            }, 500);
        }
    }
};

function selectUTXOs(isPrivate: boolean, isSpark: boolean, istransparentaddress: boolean, amount: bigint, feePerKb: bigint, subtractFeeFromAmount: boolean, availableUTXOs: TXO[], coinControl: boolean): [bigint, TXO[]] {
    let constantSize;
    if(!isPrivate && istransparentaddress) {
        constantSize = 78n;
    } else if (isPrivate && !isSpark) {
        constantSize = 1234n;
    } else if(isPrivate && isSpark && !istransparentaddress) {
        constantSize = 1281n;
    } else if(isPrivate && isSpark && istransparentaddress) {
        constantSize = 1068n;
    } else if (!isPrivate && isSpark && !istransparentaddress) {
        constantSize = 348n;
    }

    if (coinControl) {
        let totalSize = 0n;
        let gathered = 0n;
        let fee = 0n;
        if (availableUTXOs.find(utxo => utxo.isPrivate != isPrivate)) return undefined;

        if (!isPrivate && isSpark && !istransparentaddress) {
            let destinations = [];
            for (const utxo of availableUTXOs) {
                if(!destinations.includes(utxo.destination)) {
                    totalSize+= constantSize + BigInt(utxo.spendSize) || 5000n;
                    destinations.push(utxo.destination);
                } else {
                    totalSize += BigInt(utxo.spendSize) || 5000n;
                }
                gathered += utxo.amount;
                if (gathered >= (subtractFeeFromAmount ? amount : amount + fee))
                    break;
            }
        } else {
            // assume 5000 as the signature size for unknown outputs.
            totalSize = constantSize + availableUTXOs.reduce((a, utxo) => a + BigInt(utxo.spendSize) || 5000n, 0n);
            gathered = availableUTXOs.reduce((a, utxo) => a + utxo.amount, 0n);
        }

        fee = (totalSize * feePerKb) / 1000n ;
        if (fee === 0n) fee = 1n;

        if (subtractFeeFromAmount && fee >= amount) return undefined;
        if (gathered < (subtractFeeFromAmount ? amount : amount + fee)) {
            return undefined;
        }

        return [fee, availableUTXOs];
    }

    const utxos = availableUTXOs
        .filter(utxo => utxo.isPrivate == isPrivate)
        .sort((a, b) => Number(b.amount - a.amount));

    let gathered = 0n;

    const selectedUTXOs = [];
    if (!isPrivate && isSpark && !istransparentaddress) {
        let destinations = [];
        let totalSize = 0n;
        while (utxos.length) {
            const utxo = utxos.length % 2 ? utxos.shift() : utxos.pop();
            if(!destinations.includes(utxo.destination)) {
                totalSize+= constantSize + BigInt(utxo.spendSize);
                destinations.push(utxo.destination);
            } else {
                totalSize += BigInt(utxo.spendSize);
            }

            gathered += utxo.amount;
            selectedUTXOs.push(utxo);

            let fee = (totalSize * feePerKb) / 1000n;
            if (fee === 0n) fee = 1n;

            if (subtractFeeFromAmount && amount <= fee) continue;
            if (gathered >= (subtractFeeFromAmount ? amount : amount + fee)) {
                return [fee, selectedUTXOs];
            }
        }
    } else {
        let totalSize = constantSize;
        while (utxos.length) {
            const utxo = utxos.length % 2 ? utxos.shift() : utxos.pop();
            gathered += utxo.amount;
            totalSize += BigInt(utxo.spendSize);
            selectedUTXOs.push(utxo);

            let fee = (totalSize * feePerKb) / 1000n;
            if (fee === 0n) fee = 1n;

            if (subtractFeeFromAmount && amount <= fee) continue;
            if (gathered >= (subtractFeeFromAmount ? amount : amount + fee)) {
                return [fee, selectedUTXOs];
            }
        }
    }

    return undefined;
}

const getters = {
    transactions: (state): {[txid: string]: Transaction} => state.transactions,
    spentSerialHashes: (state, getters): Set<string> =>
        new Set((<Transaction[]>Object.values(getters.transactions)).reduce((a, tx) => [...a, ...tx.lelantusInputSerialHashes], [])),
    spentLTagHashes: (state, getters): Set<string> =>
        new Set((<Transaction[]>Object.values(getters.transactions)).reduce((a, tx) => [...a, ...tx.sparkInputLTagHashes], [])),
    spentPublicInputs: (state, getters): Set<string> =>
        new Set((<Transaction[]>Object.values(getters.transactions)).reduce((a, tx) => [...a, ...tx.publicInputs], []).map(i => `${i[0]}-${i[1]}`)),
    allTXOs: (state, getters): TXO[] => (<Transaction[]>Object.values(getters.transactions))
    .reduce((a: TXO[], tx: Transaction): TXO[] => a.concat(txosFromTx(tx, getters.spentLTagHashes, getters.spentSerialHashes, getters.spentPublicInputs)), []),
    TXOs: (state, getters): TXO[] => getters.allTXOs
        // Don't display orphaned mining transactions.
        .filter(txo => !(txo.blockHash && !txo.blockHeight && txo.inputPrivacy === 'mined'))
        // Hide Elysium notification transactions. These shouldn't be spent normally because a TXO outputting to a given
        // Elysium address is required to mint or spend publicly from that address.
        .filter(txo => !txo.isElysiumReferenceOutput),
    TXOMap: (state, getters): {[txidIndex: string]: TXO} => fromPairs(getters.allTXOs.map(txo => [`${txo.txid}-${txo.index}`, txo])),
    UTXOs: (state, getters): TXO[] => getters.TXOs.filter((txo: TXO) =>
        !txo.isSpent &&
        !getters.spentLTagHashes.has(txo.sparkInputLTagHashes) &&
        !getters.spentSerialHashes.has(txo.lelantusSerialHash) &&
        !getters.spentPublicInputs.has(`${txo.txid}-${txo.index}`)
    ),
    availableUTXOs: (state, getters, rootState, rootGetters): TXO[] => {
        let isSparkAllowed: boolean = rootGetters['ApiStatus/isSparkAllowed'];
        return getters.UTXOs.filter((txo: TXO) =>
            txo.isToMe &&
            // Elysium has reference outputs that we should not allow the user to spend.
            !txo.isElysiumReferenceOutput &&
            (rootGetters['App/allowBreakingMasternodes'] || !txo.isLocked) &&
            txo.spendSize &&
            txo.validAt <= rootGetters['ApiStatus/currentBlockHeight'] + 1 &&
            txo.amount > 0 &&
            (txo.isPrivate ? (isSparkAllowed ? ["spark-mint", "spark-smint"].includes(txo.scriptType) : ["lelantus-mint", "lelantus-jmint"].includes(txo.scriptType)) : true)
        )
    },
    lockedUTXOs: (state, getters) => getters.UTXOs.filter((txo: TXO) => txo.isLocked),

    availableUTXOsWithLock: (state, getters, rootState, rootGetters): TXO[] => {
        let isSparkAllowed: boolean = rootGetters['ApiStatus/isSparkAllowed'];
        return getters.UTXOs.filter((txo: TXO) =>
            txo.isToMe &&
            // Elysium has reference outputs that we should not allow the user to spend.
            !txo.isElysiumReferenceOutput &&
            txo.spendSize &&
            txo.validAt <= rootGetters['ApiStatus/currentBlockHeight'] + 1 &&
            txo.amount > 0 &&
            (txo.isPrivate ? (isSparkAllowed ? ["spark-mint", "spark-smint"].includes(txo.scriptType) : ["lelantus-mint", "lelantus-jmint"].includes(txo.scriptType)) : true)
        )
    },

    // This will display:
    // 1) valid Elysium non-Lelantus Mint transactions
    // 2) unconfirmed Elysium non-Lelantus Mint from us
    // 3) InstantSend-locked non-Elysium transactions
    // 4) unconfirmed transactions from us
    // 5) mined non-Elysium transactions
    //
    // It will not display:
    // 1) mined and invalid Elysium transactions (whether or not they are from us)
    // 2) orphan transactions
    // 3) unconfirmed and non-InstantSend-locked transactions to us
    // 4) unconfirmed but InstantSend-locked Elysium transactions to us
    // 5) Elysium reference outputs
    // 6) Elysium Lelantus Mint transactions
    userVisibleTransactions: (state, getters, rootState, rootGetters): TXO[] => getters.allTXOs
        .filter((txo: TXO) =>
                !(txo.isChange && !txo.isElysiumReferenceOutput) &&
                !(txo.inputPrivacy === 'mined' && !txo.blockHeight) &&
                !(txo.elysium && !txo.isElysiumReferenceOutput) &&
                !(txo.isElysiumReferenceOutput && txo.index !== 1) &&
                !(txo.isElysiumReferenceOutput && !rootGetters['App/enableElysium']) &&
                !(txo.isElysiumReferenceOutput && txo.elysium.property && !rootGetters['Elysium/selectedTokens'].includes(txo.elysium.property.creationTx)) &&
                !((txo.blockHeight || !txo.isFromMe) && txo.elysium.valid === false) &&
                !(txo.elysium.type === 'Lelantus Mint') &&
                (txo.isElysiumReferenceOutput || txo.destination || (txo.inputPrivacy === 'sparkmint' || (txo.inputPrivacy === 'sparkspend'))) &&
                (txo.isInstantSendLocked || txo.blockHeight || txo.isFromMe) &&
                (txo.isFromMe || txo.isToMe || txo.elysium.isToMe)
        )
        .sort((a, b) => b.firstSeenAt - a.firstSeenAt),

    selectInputs: (state, getters): (isPrivate: boolean, isSpark: boolean, istransparentaddress: boolean, amount: bigint, feePerKb: bigint, subtractFeeFromAmount: boolean) => CoinControl => {
        getters.availableUTXOs;
        return (isPrivate: boolean, isSpark: boolean, istransparentaddress: boolean, amount: bigint, feePerKb: bigint, subtractFeeFromAmount: boolean): CoinControl => {
            return selectUTXOs(isPrivate, isSpark, istransparentaddress, amount, feePerKb, subtractFeeFromAmount, getters.availableUTXOs, false)[1].map(utxo => [utxo.txid, utxo.index]);
        }
    },

    calculateTransactionFee: (state, getters): (isPrivate: boolean, isSpark: boolean, istransparentaddress: boolean, amount: bigint, feePerKb: bigint, subtractFeeFromAmount: boolean, coinControl?: TXO[]) => bigint => {
        getters.availableUTXOs;
        return (isPrivate: boolean, isSpark: boolean, istransparentaddress: boolean, amount: bigint, feePerKb: bigint, subtractFeeFromAmount: boolean, coinControl?: TXO[]): bigint => {
            const x = selectUTXOs(isPrivate, isSpark, istransparentaddress, amount, feePerKb, subtractFeeFromAmount, coinControl ? coinControl : getters.availableUTXOs, !!coinControl);
            return x?.[0];
        };
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    getters
};
