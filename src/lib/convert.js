import Big from 'big.js'

const coinBase = new Big(1)
const satoshiBase = new Big(0.00000001)

/**
 * returns a visual representation as a string of the satoshi passed in
 *
 * @param satoshi
 * @returns string
 */
export const convertToCoin = function (satoshi) {
    if (isNaN(satoshi)) {
        return ''
    }

    try {
        return new Big(satoshi)
            .times(satoshiBase)
            .div(coinBase)
            .toFixed(8)
    } catch (e) {
        return ''
    }
}

/**
 * returns the corresponding amount as integer in satoshi
 *
 * @param base
 * @returns {number}
 */
export const convertToSatoshi = function (base) {
    if (!base) {
        return 0
    }

    try {
        return parseInt(new Big(base)
            .times(coinBase)
            .div(satoshiBase)
            .toString())
    } catch (e) {
        return 0
    }
}
