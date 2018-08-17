<template>
    <fieldset :disabled="isDisabled">
        <div class="field" :class="getFieldErrorClass('label')">
            <label for="label">Title</label>

            <div class="control">
                <input v-model.trim="label"
                       v-validate="'required'"
                       v-tooltip="getValidationTooltip('label')"
                       type="text"
                       ref="label"
                       name="label"
                       id="label"
                       tabindex="1"
                       placeholder="placeholder with #hastag hint">
            </div>
        </div>

        <div class="field" :class="getFieldErrorClass('address')">
            <label for="address">Address</label>

            <div class="control">
                <!-- Todo add validator to check if address already exists in pending items -->
                <input v-model.trim="address"
                       v-validate="requiredAddressValidationRules"
                       data-vv-validate-on="change|blur"
                       v-tooltip="getValidationTooltip('address')"
                       type="text"
                       ref="address"
                       name="address"
                       id="address"
                       tabindex="2"
                       placeholder="placeholder">
            </div>
        </div>

        <div class="field amount-field" :class="getFieldErrorClass('amount')">
            <label for="amount">Amount</label>

            <div class="control">
                <input v-model.lazy="amount"
                       v-validate="requiredAmountValidationRules"
                       data-vv-validate-on="change"
                       v-tooltip="getValidationTooltip('amount')"
                       type="text"
                       ref="amount"
                       name="amount"
                       id="amount"
                       class="amount"
                       tabindex="3"
                       placeholder="Enter Amount to send publicly">
                <div class="prefix">XZC</div>
            </div>
        </div>
    </fieldset>
</template>

<script>
    import { addVuexModel } from '@/utils/store'
    import ValidationMixin from '@/mixins/ValidationMixin'
    import types from '~/types'

    export default {
        name: 'SendZcoinForm',

        mixins: [
            ValidationMixin
        ],

        inject: [
            '$validator'
        ],

        props: {
            isDisabled: {
                type: Boolean,
                required: true
            }
        },

        data () {
            return {
                validationFieldOrder: [
                    'label',
                    'amount',
                    'address'
                ]
            }
        },

        computed: {
            ...addVuexModel({
                name: 'label',
                getter: 'ZcoinPayment/createFormLabel',
                action: types.zcoinpayment.SET_FORM_LABEL
            }),

            ...addVuexModel({
                name: 'amount',
                getter: 'ZcoinPayment/createFormAmountAsBaseCoin',
                action: types.zcoinpayment.SET_FORM_AMOUNT
            }),

            ...addVuexModel({
                name: 'address',
                getter: 'ZcoinPayment/createFormAddress',
                action: types.zcoinpayment.SET_FORM_ADDRESS
            })
        },

        watch: {
            amount (newVal) {
                this.$validator.validate()
            },
            address (newVal) {
                this.$validator.validate()
            },
            formValidated: {
                handler (newVal, oldVal) {
                    console.log('form validated', newVal, oldVal)
                    this.$emit('form-validated', newVal)
                },
                immediate: true
            }
        }
    }
</script>

<style lang="scss" scoped>
    input[type="text"],
    select,
    .message {
        @include light-input();
    }

    .prefix {
        color: $color--polo-dark;
    }
</style>