export default {
    props: {
        autofocusFirstField: {
            type: Boolean,
            default: true
        }
    },
    data () {
        const amountRules = {
            decimal: 8
        }

        return {
            validationFieldOrder: [],
            amountValidationRules: {
                ...amountRules
            },
            requiredAmountValidationRules: {
                required: true,
                min_value: 0.001,
                ...amountRules
            },
            xzcAmountValidationRules: {
                required: true,
                min_value: 0.001,
                ...amountRules,
                // todo return via callback function. otherwise initial availableXzc state will be used.
                not_exceeding_balance: {
                    limit: this.$store.getters['Balance/availableXzc']
                }
            },
            requiredAddressValidationRules: {
                required: true,
                zcoin_address: {
                    b58Prefixes: this.$store.getters['Settings/b58Prefixes']
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
            this.validate()
        }

        if (this.autofocusFirstField && this.validationFieldOrder.length) {
            this.$nextTick(() => this.$refs[this.validationFieldOrder[0]].focus())
        }
    },

    computed: {
        validationTooltipToShow () {
            let tooltipToShow = ''

            for (let key of this.validationFieldOrder) {
                console.log(key, (this.validationFields[key]) ? this.validationFields[key].dirty : null)
                if (this.validationErrors.has(key) && this.validationFields[key].dirty) {
                    console.log(key)
                    tooltipToShow = key
                    break
                }
            }

            return tooltipToShow
        },

        formValidated () {
            const fieldNames = Object.keys(this.validationFields)

            const fieldsAreDirty = fieldNames.some(key => this.validationFields[key].touched || this.validationFields[key].dirty)
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

        validate () {
            this.$nextTick(() => this.$validator.validate())
        },

        resetValidator () {
            this.$nextTick(() => this.$validator.reset())
        }
    }
}
