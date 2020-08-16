import { Validator } from 'vee-validate'
import { isZcoinAddress } from 'lib/zcoin'

Validator.extend('zcoin_address', {
    getMessage: (field) => {
        return 'The ' + field + ' is not a valid zcoin address.'
    },

    validate: (value, { b58Prefixes }) => {
        return isZcoinAddress(value, b58Prefixes)
    }
})
