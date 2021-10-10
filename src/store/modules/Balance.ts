import {TXO} from "./Transactions";

function sumTxos(predicate: (txo: TXO, nextHeight: number) => boolean): (a, b, c, rootGetters) => number {
    return (state, getters, rootState, rootGetters): number => rootGetters['Transactions/TXOs']
        .filter((txo: TXO) => predicate(txo, rootGetters['ApiStatus/currentBlockHeight']+1))
        .reduce((a, txo: TXO) => a + txo.amount, 0);
}

const getters = {
    availablePrivate: sumTxos((txo: TXO, nextHeight: number) =>
        txo.isToMe &&
        !txo.isSpent &&
        !txo.isLocked &&
        txo.isPrivate &&
        txo.validAt <= nextHeight
    ),
    unconfirmedPrivate: sumTxos((txo: TXO, nextHeight: number) =>
        txo.isToMe &&
        !txo.isSpent &&
        !txo.isLocked &&
        txo.isPrivate &&
        txo.validAt > nextHeight
    ),
    availablePublic: sumTxos((txo: TXO, nextHeight: number) =>
        txo.isToMe &&
        !txo.isSpent &&
        !txo.isLocked &&
        !txo.isPrivate &&
        txo.validAt <= nextHeight
    ),
    unconfirmedPublic: sumTxos((txo: TXO, nextHeight: number) =>
        txo.isToMe &&
        !txo.isSpent &&
        !txo.isLocked &&
        !txo.isPrivate &&
        txo.validAt > nextHeight
    ),
    // This includes unconfirmed and immature locked funds.
    locked: sumTxos((txo: TXO, nextHeight: number) =>
        txo.isToMe &&
        !txo.isSpent &&
        txo.isLocked
    ),
    immature: sumTxos((txo: TXO, nextHeight: number) =>
        txo.isToMe &&
        !txo.isSpent &&
        !txo.isLocked &&
        txo.inputPrivacy === 'mined' &&
        txo.validAt > nextHeight
    ),
    pending: (state, getters) => getters.unconfirmedPrivate + getters.unconfirmedPublic
}

export default {
    namespaced: true,
    getters
}
