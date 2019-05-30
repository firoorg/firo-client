import Big from 'big.js'
import clone from 'lodash/clone'

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

/**
 * returns denomination with the largest possible value by not exceeding the given amount
 *
 * getLargestDenomination(42, { '10': 7, '25': 2 }) // { denomination: 25, change: 17 }
 */
export const getLargestDenomination = function (amount, denominations = {}) {
    const denominationsPairs = Object.entries(denominations).map(([ key, value ]) => [ Number(key), value ])
    const denoms = denominationsPairs.map(([ key ]) => key).reverse()
    let denomination = null

    for (let denom of denoms) {
        if (amount >= denom && denominations[`${denom}`] > 0) {
            denomination = denom
            break
        }
    }

    return {
        denomination,
        change: amount - denomination
    }
}

export const getDenominationsToSpend = function ({ amount, denominations = {}, limit = -1 }) {
    const denomsToSpend = {}
    const denoms = clone(denominations)
    let amountToSpend = amount
    let found = false
    let counter = 0

    do {
        counter++
        const { denomination } = getLargestDenomination(amountToSpend, denoms)
        const key = `${denomination}`

        found = !!denomination

        if (!found) {
            break
        }

        amountToSpend -= denomination

        if (!denomsToSpend[key]) {
            denomsToSpend[key] = 0
        }

        denomsToSpend[key]++

        if (denoms[key] > 0) {
            denoms[key]--
        }
    } while (found && (limit === -1 || counter < limit))

    return {
        toSpend: denomsToSpend,
        denominations: denoms,
        change: amountToSpend
    }
}

export const getDenominationsToMint = function (amount, denoms = [0.1, 0.5, 1, 10, 100]) {
    const denomsToMint = {}
    const reversed = denoms.reverse()

    let amountToMint = amount
    let found = false

    let counter = 0

    do {
        counter++
        found = false

        for (let denom of reversed) {
            if (denom > amountToMint) {
                continue
            }

            if (denomsToMint[`${denom}`] >= 10) {
                continue
            }

            if (denomsToMint[`${denom}`] === undefined) {
                denomsToMint[`${denom}`] = 0
            }
            denomsToMint[`${denom}`]++
            amountToMint -= denom
            found = true
            break
        }
    } while (found && counter < 100)
    return {
        toMint: denomsToMint,
        change: amountToMint
    }
}
