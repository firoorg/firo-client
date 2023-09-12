import {Transaction, TxOut, CoinControl, ElysiumData} from '../../daemon/firod';
import {cloneDeep, fromPairs} from "lodash";

type PrivacyType = 'public' | 'lelantus' | 'spark';
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
    privacyUse: PrivacyType;
    // This indicates whether the transaction as a whole was private.
    inputPrivacy: 'public' | 'zerocoin' | 'sigma' | 'lelantus' | 'mined' | 'sparkmint' | 'sparkspend';
    validAt: number;
    firstSeenAt: number;
    isFromMe: boolean;
    fee: bigint;
    spendSize?: number; // undefined if unknown
    elysium?: ElysiumData;
    lelantusInputSerialHashes?: string[];
    sparkInputSerialHashes?: string[];
    sparkMemo?: string;
    // This will exist only if isFromMe is true.
    totalSparkOutput?: bigint;
}

function txosFromTx(tx: Transaction, mySparkOutputAmounts: Map<string, bigint>, spentSparkSerialHashes: Set<string>, spentLelantusSerialHashes: Set<string>, spentPublicInputs: Set<string>): TXO[] {
    const txos: TXO[] = [];

    let sparkInputAmount = 0n;
    for (const serialHash of tx.sparkInputSerialHashes) {
        const amount = mySparkOutputAmounts.get(serialHash);
        if (sparkInputAmount && !amount)
            console.warn(`Only some inputs of spark tx ${tx.txid} are from us; information about this tx may be inaccurate.`);

        sparkInputAmount += amount || 0n;
    }
    const changeTxoAmount = tx.outputs
        .filter(txo => txo.isChange && txo.amount)
        .reduce((a: bigint, txo: TxOut) => a + txo.amount, 0n);
    const nonChangeTxos = tx.outputs.filter(txo => !txo.isChange).length;

    // These will only exist for transactions from us.
    let totalSparkOutput: bigint;
    if (sparkInputAmount > 0n) {
        totalSparkOutput = sparkInputAmount - changeTxoAmount - tx.fee;
    }

    let index = -1;
    for (const txout of tx.outputs) {
        index += 1;

        let isFromMe = false;
        if (typeof tx.isFromMe == 'boolean') {
            isFromMe = tx.isFromMe;
        } else {
            isFromMe = sparkInputAmount > 0n;
        }

        // This is for txouts of multi-recipient transactions that we've received funds from that go to other wallets.
        if (!isFromMe && !txout.isToMe && !tx.elysium.isToMe) continue;

        let privacyUse: PrivacyType;
        let spendSize = undefined;
        switch (txout.scriptType) {
            case "spark-mint":
            case "spark-smint":
            case "spark-spend":
                privacyUse = 'spark';
                spendSize = 2535;
                break;

            case "lelantus-mint":
            case "lelantus-jmint":
            case "lelantus-joinsplit":
                privacyUse = 'lelantus';
                spendSize = 2560;
                break;

            case "pay-to-public-key":
                privacyUse = 'public';
                spendSize = 114;
                break;

            case "pay-to-public-key-hash":
            case "pay-to-script-hash":
                privacyUse = 'public';
                spendSize = 148;
                break;

            case "sigma-mint":
            case "sigma-spend":
            case "pay-to-witness-script-hash":
            case "zerocoin-mint":
            case "zerocoin-remint":
            case "zerocoin-spend":
            case "elysium":
                break;

            default:
                console.warn(`${tx.txid}-${index} has an unknown scriptType`);
        }

        let validAt = Infinity;
        if (!tx.blockHeight && !tx.isInstantSendLocked) validAt = Infinity;
        else if (tx.inputType == "mined") validAt = tx.blockHeight + 101;
        else if (privacyUse == 'public') validAt = 0;
        else if (tx.blockHeight) validAt = tx.blockHeight + 1;

        let isSpent: boolean;
        if (privacyUse == 'public')
            isSpent = spentPublicInputs.has(`${tx.txid}-${index}`);
        else if (privacyUse == 'lelantus')
            isSpent = spentLelantusSerialHashes.has(txout.lelantusSerialHash);
        else if (privacyUse == 'spark')
            isSpent = spentSparkSerialHashes.has(txout.sparkSerialHash);

        let amount = txout.amount || 0n;
        if (!amount && totalSparkOutput && nonChangeTxos == 1) {
            amount = totalSparkOutput;
        }

        txos.push({
            amount,
            blockHash: tx.blockHash,
            blockHeight: tx.blockHeight,
            blockTime: tx.blockTime,
            txid: tx.txid,
            index,
            privacyUse,
            inputPrivacy: tx.inputType,
            isFromMe,
            validAt,
            firstSeenAt: tx.firstSeenAt,
            spendSize,
            fee: tx.fee,
            isInstantSendLocked: tx.isInstantSendLocked,
            elysium: tx.elysium,
            publicInputs: tx.publicInputs,
            lelantusInputSerialHashes: tx.lelantusInputSerialHashes,
            sparkInputSerialHashes: tx.sparkInputSerialHashes,
            isSpent,
            totalSparkOutput,
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

function selectUTXOs(privacy: PrivacyType, amount: bigint, feePerKb: bigint, subtractFeeFromAmount: boolean, availableUTXOs: TXO[], coinControl: boolean): [bigint, TXO[]] {
    // These include the cost for 1 output, which will always be the case with firo-client.
    let constantSize;
    if (privacy == 'public')
        constantSize = 78n;
    else if (privacy == 'lelantus')
        constantSize = 1234n;
    else if (privacy == 'spark')
    constantSize = 1281n;

    if (coinControl) {
        let totalSize = 0n;
        let gathered = 0n;
        let fee = 0n;

        // assume 5000 as the signature size for unknown outputs.
        totalSize = constantSize + availableUTXOs.reduce((a, utxo) => a + BigInt(utxo.spendSize), 0n);
        gathered = availableUTXOs.reduce((a, utxo) => a + utxo.amount, 0n);

        fee = (totalSize * feePerKb) / 1000n ;
        if (fee === 0n) fee = 1n;

        if (subtractFeeFromAmount && fee >= amount) return undefined;
        if (gathered < (subtractFeeFromAmount ? amount : amount + fee)) {
            return undefined;
        }

        return [fee, availableUTXOs];
    }

    const utxos = availableUTXOs
        .filter(utxo => utxo.privacyUse == privacy)
        .sort((a, b) => Number(b.amount - a.amount));

    let gathered = 0n;

    const selectedUTXOs = [];
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

    return undefined;
}

const getters = {
    transactions: (state): {[txid: string]: Transaction} => state.transactions,
    mySparkOutputAmounts: (state, getters): Map<string, bigint> => {
        const amounts = new Map<string, bigint>();
        for (const tx of <Transaction[]>Object.values(getters.transactions)) {
            for (const output of tx.outputs) {
                if (output.sparkSerialHash) {
                    amounts.set(output.sparkSerialHash, output.amount);
                }
            }
        }
        return amounts;
    },
    spentLelantusSerialHashes: (state, getters): Set<string> =>
        new Set((<Transaction[]>Object.values(getters.transactions)).reduce((a, tx) => [...a, ...tx.lelantusInputSerialHashes], [])),
    spentSparkSerialHashes: (state, getters): Set<string> =>
        new Set((<Transaction[]>Object.values(getters.transactions)).reduce((a, tx) => [...a, ...tx.sparkInputSerialHashes], [])),
    spentPublicInputs: (state, getters): Set<string> =>
        new Set((<Transaction[]>Object.values(getters.transactions)).reduce((a, tx) => [...a, ...tx.publicInputs], []).map(i => `${i[0]}-${i[1]}`)),
    allTXOs: (state, getters): TXO[] => (<Transaction[]>Object.values(getters.transactions)).reduce(
        (a: TXO[], tx: Transaction): TXO[] => [...a, ...txosFromTx(tx, getters.mySparkOutputAmounts, getters.spentSparkSerialHashes, getters.spentLelantusSerialHashes, getters.spentPublicInputs)],
        []
    ),
    TXOs: (state, getters): TXO[] => getters.allTXOs
        // Don't display orphaned mining transactions.
        .filter(txo => !(txo.blockHash && !txo.blockHeight && txo.inputPrivacy === 'mined'))
        // Hide Elysium notification transactions. These shouldn't be spent normally because a TXO outputting to a given
        // Elysium address is required to mint or spend publicly from that address.
        .filter(txo => !txo.isElysiumReferenceOutput),
    TXOMap: (state, getters): {[txidIndex: string]: TXO} => fromPairs(getters.allTXOs.map(txo => [`${txo.txid}-${txo.index}`, txo])),
    UTXOs: (state, getters): TXO[] => getters.TXOs.filter((txo: TXO) =>
        !txo.isSpent &&
        !getters.spentSparkSerialHashes.has(txo.sparkSerialHash) &&
        !getters.spentLelantusSerialHashes.has(txo.lelantusSerialHash) &&
        !getters.spentPublicInputs.has(`${txo.txid}-${txo.index}`)
    ),
    availableUTXOs: (state, getters, rootState, rootGetters): TXO[] => getters.UTXOs.filter((txo: TXO) =>
        txo.isToMe &&
        // Elysium has reference outputs that we should not allow the user to spend.
        !txo.isElysiumReferenceOutput &&
        (rootGetters['App/allowBreakingMasternodes'] || !txo.isLocked) &&
        txo.spendSize &&
        txo.validAt <= rootGetters['ApiStatus/currentBlockHeight'] + 1 &&
        txo.amount > 0 &&
        !(txo.privacyUse == 'spark' && !rootGetters['ApiStatus/isSparkAllowed'])
    ),
    lockedUTXOs: (state, getters) => getters.UTXOs.filter((txo: TXO) => txo.isLocked),


    // This will display:
    // 1) valid Elysium non-Lelantus Mint transactions
    // 2) unconfirmed Elysium non-Lelantus Mint from us
    // 3) InstantSend-locked non-Elysium transactions
    // 4) unconfirmed transactions from us
    // 5) mined non-Elysium transactions
    // 6) mints from us if App/showMints is true
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
                txo.scriptType != 'lelantus-jmint' &&
                !(txo.inputPrivacy === 'mined' && !txo.blockHeight) &&
                !(txo.elysium && !txo.isElysiumReferenceOutput) &&
                !(txo.isElysiumReferenceOutput && txo.index !== 1) &&
                !(txo.isElysiumReferenceOutput && !rootGetters['App/enableElysium']) &&
                !(txo.isElysiumReferenceOutput && txo.elysium.property && !rootGetters['Elysium/selectedTokens'].includes(txo.elysium.property.creationTx)) &&
                !((txo.blockHeight || !txo.isFromMe) && txo.elysium.valid === false) &&
                !(txo.elysium.type === 'Lelantus Mint') &&
                (txo.isElysiumReferenceOutput || txo.destination || (txo.scriptType == 'spark-mint' && (rootGetters['App/showMints'] || !txo.isFromMe || !txo.isToMe)) || ['spark-smint', 'spark-spend'].includes(txo.scriptType) || (rootGetters['App/showMints'] && txo.privacyUse == 'lelantus')) &&
                (txo.isInstantSendLocked || txo.blockHeight || txo.isFromMe) &&
                (txo.isFromMe || txo.isToMe || txo.elysium.isToMe)
        )
        .sort((a, b) => b.firstSeenAt - a.firstSeenAt),

    selectInputs: (state, getters) =>
        (privacy: PrivacyType, amount: bigint, feePerKb: bigint, subtractFeeFromAmount: boolean): CoinControl =>
            selectUTXOs(privacy, amount, feePerKb, subtractFeeFromAmount, getters.availableUTXOs, false)[1]
                .map(utxo => [utxo.txid, utxo.index])
    ,

    calculateTransactionFee: (state, getters) =>
        (privacy: PrivacyType, amount: bigint, feePerKb: bigint, subtractFeeFromAmount: boolean, coinControl?: TXO[]): bigint => selectUTXOs(privacy, amount, feePerKb, subtractFeeFromAmount, coinControl ? coinControl : getters.availableUTXOs, !!coinControl)?.[0]
};

export default {
    namespaced: true,
    state,
    mutations,
    getters
};
