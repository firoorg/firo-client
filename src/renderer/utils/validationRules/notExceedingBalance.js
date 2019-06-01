import { Validator } from 'vee-validate'
import { convertToSatoshi, convertToCoin } from '#/lib/convert'

Validator.extend('not_exceeding_balance', {
    getMessage: (field, { limit }) => {
        const limitAsBaseCoin = convertToCoin(limit)
        return `The amount your have entered exceeds your available balance of ${limitAsBaseCoin}`
    },

    validate: (value, { limit }) => {
        const valueInSatoshi = convertToSatoshi(value)

        if (!valueInSatoshi) {
            return false
        }

        // todo include fees?
        return valueInSatoshi < limit
    }
})
