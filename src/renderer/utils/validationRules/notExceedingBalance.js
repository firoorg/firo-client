import { Validator } from 'vee-validate'
import { bigintToString, stringToBigint } from 'lib/convert'

Validator.extend('not_exceeding_balance', {
    getMessage: (field, { limit }) => {
        const limitAsBaseCoin = bigintToString(BigInt(limit))
        return `The amount your have entered exceeds your available balance of ${limitAsBaseCoin}`
    },

    validate: (value, { limit }) => {
        let valueInSatoshi;
        try {
            valueInSatoshi = stringToBigint(value)
        } catch {
            return false;
        }

        // todo include fees?
        return valueInSatoshi < limit
    }
})
