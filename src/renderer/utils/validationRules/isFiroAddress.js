import { Validator } from 'vee-validate'
import { isFiroAddress } from 'lib/firo'

Validator.extend('firo_address', {
    getMessage: (field) => {
        return 'The ' + field + ' is not a valid firo address.'
    },

    validate: (value, { b58Prefixes }) => {
        return isFiroAddress(value, b58Prefixes)
    }
})
