export default {
    props: {
        autofocusFirstField: {
            type: Boolean,
            default: true
        }
    },
    data () {
        const amountRules = {
            decimal: 8,
            min_value: 0.001,
            not_exceeding_balance: {
                limit: this.$store.getters['Balance/availableXzc']
            }
        }

        return {
            validationFieldOrder: [],
            amountValidationRules: {
                ...amountRules
            },
            requiredAmountValidationRules: {
                required: true,
                ...amountRules
            },
            requiredAddressValidationRules: {
                required: true,
                zcoin_address: {
                    ...this.$store.getters['Settings/b58Prefixes']
                }
            }
        }
    },

    mounted () {
        let hasValue = false
        for (let fieldName of this.validationFieldOrder) {
            if (this[fieldName]) {
                hasValue = true
                break
            }
        }

        if (hasValue) {
            this.$validator.validate()
        }

        if (this.autofocusFirstField && this.validationFieldOrder.length) {
            this.$nextTick(() => this.$refs[this.validationFieldOrder[0]].focus())
        }
    },

    computed: {
        validationTooltipToShow () {
            let tooltipToShow = ''

            for (let key of this.validationFieldOrder) {
                if (this.validationErrors.has(key) && this.validationFields[key].touched) {
                    tooltipToShow = key
                    break
                }
            }

            return tooltipToShow
        },

        formValidated () {
            const fieldNames = Object.keys(this.validationFields)

            const fieldsAreDirty = fieldNames.some(key => this.validationFields[key].touched)
            const fieldsValidated = fieldNames.some(key => this.validationFields[key].validated)
            const fieldValuesAreValid = fieldNames.every(key => this.validationFields[key].valid)

            return fieldsAreDirty && fieldsValidated && fieldValuesAreValid
        },

        canSubmit () {
            return this.formValidated
        }
    },

    methods: {
        getValidationTooltip (fieldName) {
            return {
                content: this.validationErrors.first(fieldName),
                trigger: 'manual',
                boundariesElement: 'body',
                offset: 8,
                placement: 'left',
                classes: 'error',
                show: this.validationTooltipToShow === fieldName
            }
        },

        getFieldErrorClass (fieldName) {
            return this.validationErrors.has(fieldName) ? ['has-error'] : []
        },

        resetValidator () {
            this.$nextTick(() => this.$validator.reset())
        }
    }
}
