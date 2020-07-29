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

// Determine the coins we need to mint to get as close to amount as we can with the least number of mints, making sure
// the total amount including fees doesn't exceed amount.
export function getDenominationsToMintSubtractingFee(amount: number): {[denomination: number]: number} {
    // We MUST be listed in descending order.
    const DENOMINATIONS = [100e8, 25e8, 10e8, 1e8, 0.5e8, 0.1e8, 0.05e8];
    const FEE = 0.001e8; // We MUST be less than all values in DENOMINATIONS.

    let remaining = amount;
    const toMint = {};

    for (const denomination of DENOMINATIONS) {
        toMint[denomination] = ~~(remaining / denomination);
        remaining = remaining % denomination - (toMint[denomination] * FEE);

        if (remaining < 0) {
            // If remaining < 0, toMint[denomination] will be >= 1.
            toMint[denomination] -= 1;
            remaining += denomination + FEE;
        }
    }

    return toMint;
}

// Determine the coins we need to mint to get as close to amount as we can with the least number of mints, making sure
// the total amount including fees doesn't exceed amount.
//
// Returns a tuple of denominations and fee.
export function getDenominationsToMintSeparatingFee(amount: number): [{[denomination: number]: number}, number] {
    // We MUST be listed in descending order.
    const DENOMINATIONS = [100e8, 25e8, 10e8, 1e8, 0.5e8, 0.1e8, 0.05e8];
    const FEE = 0.001e8; // We MUST be less than all values in DENOMINATIONS.

    let remaining = amount;
    let fee = 0;
    const toMint = {};

    for (const denomination of DENOMINATIONS) {
        toMint[denomination] = ~~(remaining / denomination);
        remaining = remaining % denomination;
        fee += toMint[denomination] * FEE

        if (remaining < 0) {
            // If remaining < 0, toMint[denomination] will be >= 1.
            toMint[denomination] -= 1;
            remaining += denomination;
            fee -= FEE;
        }
    }

    return [toMint, fee];
}

