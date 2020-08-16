import ValidationMixin from 'renderer/mixins/ValidationMixin'

import { addVuexModel } from 'renderer/utils/store'

export default {
    mixins: [
        ValidationMixin
    ],

    $_veeValidate: {
        validator: 'new' // give me my own validator instance.
    },

    data () {
        return {
            isValid: false,
            currentValue: undefined,

            validationFieldOrder: [
                'currentValue'
            ]
        }
    },

    watch: {
        validationErrors: {
            deep: true,
            immediate: true,
            handler (errorsNew) {
                this.isValid = !errorsNew.items.length

                if (this.currentValue === undefined) {
                    return
                }

                if (!this.isValid) {
                    return
                }

                this.storeValue = this.currentValue
            }
        },

        storeValue: {
            immediate: true,
            handler (valNew) {
                this.currentValue = valNew
            }
        }
    }
    /*,

    mounted () {
        this.currentValue = this.storeValue
    }*/
}
