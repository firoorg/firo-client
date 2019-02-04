import ValidationMixin from '@/mixins/ValidationMixin'

import { addVuexModel } from '@/utils/store'

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
            currentValue: null,

            validationFieldOrder: [
                'currentValue'
            ]
        }
    },

    watch: {
        validationErrors: {
            deep: true,
            immediate: true,
            handler: function (errorsNew) {
                this.isValid = !errorsNew.items.length

                if (this.isValid) {
                    this.storeValue = this.currentValue
                }
            }
        }
    },

    mounted () {
        this.currentValue = this.storeValue
    }
}
