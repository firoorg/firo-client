import shajs from 'sha.js'
import bs58 from 'bs58'

/*
 * Returns true if the given address is a valid with the given prefixes
 */
export const isZcoinAddress = function (address, b58Prefixes) {
    let data = null

    if (!b58Prefixes || !b58Prefixes['pubkeyAddress'] || !b58Prefixes['pubkeyAddress']) {
        console.warning('no b58 prefixes given to zcoin address validation')
        return false
    }

    try {
        data = bs58.decode(address)
    } catch (e) {
        // encoding error
        return false
    }

    if (data.length <= 5) {
        return false
    }

    const [ prefix ] = data
    const { pubkeyAddress: pubkeyAddressPrefix } = b58Prefixes

    // prefix check
    if (prefix !== pubkeyAddressPrefix) {
        return false
    }

    const pubkeyHash = data.slice(0, -4)
    const checkSum = data.slice(-4)

    // double sha256 of the hash pick the first four items
    const pubkeyDoubleHashShaPrefix = shajs('sha256')
        .update(shajs('sha256').update(pubkeyHash).digest())
        .digest()
        .slice(0, 4)

    // check if pubkeyDoubleHashShaPrefix equals checkSum
    return pubkeyDoubleHashShaPrefix.length === checkSum.length &&
        pubkeyDoubleHashShaPrefix.every((v, i) => v === checkSum[i])
}

export const containsZcoinAddress = function (text, prefixes) {
    console.log('contains zcoin address', text, prefixes)

    return text
        .split(/\s/)
        .reduce((accumulator, word) => {
            if (isZcoinAddress(word, prefixes)) {
                accumulator.push(word)
            }

            return accumulator
        }, [])
}

export const containsZcoinUri = function (text) {
    const zcoinUri = new RegExp('(zcoin://)([a-zA-Z0-9_])(:[0-9]+)?(/.*)?')

    console.log(zcoinUri.test(text))

    return zcoinUri.test(text)
}
