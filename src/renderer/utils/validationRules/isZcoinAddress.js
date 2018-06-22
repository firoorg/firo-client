import bs58 from 'bs58'
import { Validator } from 'vee-validate'
import shajs from 'sha.js'

Validator.extend('zcoin_address', {
    getMessage: (field) => {
        return 'The ' + field + ' is not a valid zcoin address.'
    },

    validate: (value, [b58Prefixes]) => {
        let data = null

        if (!b58Prefixes || !b58Prefixes['pubkeyAddress'] || !b58Prefixes['pubkeyAddress']) {
            console.warning('no b58 prefixes given to zcoin address validation')
            return false
        }

        try {
            data = bs58.decode(value)
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

        // double sha256 of the . pick the first four items
        const pubkeyDoubleHashShaPrefix = shajs('sha256')
            .update(shajs('sha256').update(pubkeyHash).digest())
            .digest()
            .slice(0, 4)

        // check if pubkeyDoubleHashShaPrefix equals checkSum
        return pubkeyDoubleHashShaPrefix.length === checkSum.length &&
            pubkeyDoubleHashShaPrefix.every((v, i) => v === checkSum[i])
    }
})
