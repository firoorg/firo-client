import Big from 'big.js'

const coinBase = new Big(1)
const satoshiBase = new Big(0.00000001)

export const convertToCoin = function (satoshi) {
    return new Big(satoshi)
        .times(satoshiBase)
        .div(coinBase)
        .toFixed(8)
}

export const convertToSatoshi = function (base) {
    return new Big(base)
        .times(coinBase)
        .div(satoshiBase)
        .toString()
}
