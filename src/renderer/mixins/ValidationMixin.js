export default {
    props: {
        autofocusFirstField: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            validationFieldOrder: [],
            amountValidationRules: {
                decimal: 8,
                min_value: 0.001
            }
        }
    },

    mounted () {
        if (this.autofocusFirstField && this.validationFieldOrder.length) {
            this.$nextTick(() => this.$refs[this.validationFieldOrder[0]].focus())
        }
    },

    computed: {
        validationTooltipToShow () {
            let tooltipToShow = ''

            for (let key of this.validationFieldOrder) {
                if (this.validationErrors.has(key) && this.validationFields[key].dirty) {
                    tooltipToShow = key
                    break
                }
            }

            return tooltipToShow
        },

        formValidated () {
            const fieldNames = Object.keys(this.validationFields)

            const fieldsAreDirty = fieldNames.some(key => this.validationFields[key].dirty)
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
                placement: 'right',
                classes: 'error',
                show: this.validationTooltipToShow === fieldName
            }
        },

        resetValidator () {
            this.$nextTick(() => this.$validator.reset())
        }
    }
}
