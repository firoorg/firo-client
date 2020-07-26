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
        Big.NE = -9; // Never truncate the satoshis place.
        return new Big(satoshi)
            .times(satoshiBase)
            .div(coinBase)
            .toString()
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

// Get the maximum amount of denominations we can mint from a given amount of satoshis. Both our output and input are in
// satoshis.
export function getDenominationsToMint(amount) {
    // We MUST be listed in descending order.
    const DENOMINATIONS = [100e8, 25e8, 10e8, 1e8, 0.5e8, 0.1e8, 0.05e8];
    const FEE = 0.001e8;

    let remaining = amount;
    const toMint = {};

    for (const denomination of DENOMINATIONS) {
        toMint[denomination] = ~~(remaining / denomination);
        remaining = remaining % denomination - (toMint[denomination] * FEE);

        if (remaining < 0) {
            // If remaining < 0, toMint[denomination] will be >= 1.
            toMint[denomination] = toMint[denomination] - 1;
            remaining += denomination;
        }
    }

    return toMint;
}
