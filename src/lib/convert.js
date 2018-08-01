import Big from 'big.js'

const coinBase = new Big(1)
const satoshiBase = new Big(0.00000001)

export const convertToCoin = function (satoshi) {
    if (!satoshi) {
        return (0).toFixed(8)
    }

    return new Big(satoshi)
        .times(satoshiBase)
        .div(coinBase)
        .toFixed(8)
}

export const convertToSatoshi = function (base) {
    if (!base) {
        return (0).toString()
    }

    return new Big(base)
        .times(coinBase)
        .div(satoshiBase)
        .toString()
}
