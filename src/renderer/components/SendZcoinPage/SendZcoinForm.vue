<template>
    <fieldset :disabled="isDisabled">
        <div class="field" :class="getFieldErrorClass('label')">
            <label for="label">Label</label>

            <div class="control">
                <input v-model.trim="label"
                       v-validate="'required'"
                       v-tooltip="getValidationTooltip('label')"
                       type="text"
                       ref="label"
                       name="label"
                       id="label"
                       tabindex="1"
                       placeholder="Wonder Woman dress #shopping for #team">
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
                       placeholder="Add a valid zcoin address">
            </div>
        </div>

        <div class="field amount-field" :class="getFieldErrorClass('amount')">
            <label for="amount">Amount</label>

            <div class="control">
                <send-private-popover :is-open="showCanSpendPrivateTooltip"
                                      :boundaries-element="boundariesElement"
                                      @cancel="onCanSpendPrivateTooltipCancel"
                                      @submit="onCanSpendPrivateTooltipSubmit">
                    <input v-model.lazy="amount"
                           v-validate="xzcAmountValidationRules"
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
                </send-private-popover>
            </div>
        </div>
    </fieldset>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import { addVuexModel } from '@/utils/store'
    import { getDenominationsToSpend } from '#/lib/convert'
    import ValidationMixin from '@/mixins/ValidationMixin'
    import types from '~/types'
    import SendPrivatePopover from '@/components/SendZcoinPage/SendPrivatePopover'

    export default {
        name: 'SendZcoinForm',
        components: {
            SendPrivatePopover
        },

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
            },
            boundariesElement: {
                type: HTMLElement,
                required: true
            }
        },

        data () {
            return {
                validationFieldOrder: [
                    'label',
                    'amount',
                    'address'
                ],
                spendPrivateTooltipAmountSeen: null
            }
        },

        computed: {
            ...mapGetters({
                confirmedMintsPerDenomination: 'Mint/confirmedMintsPerDenomination'
            }),

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
            }),

            amountConvertedToDenominations () {
                const amount = Number.parseFloat(this.amount)
                const empty = {
                    toSpend: 0,
                    change: amount,
                    denominations: this.confirmedMintsPerDenomination
                }

                if (!amount || Number.isNaN(amount)) {
                    return empty
                }

                if (!Number.isInteger(amount)) {
                    return empty
                }

                return getDenominationsToSpend(amount, this.confirmedMintsPerDenomination)
            },

            showCanSpendPrivateTooltip () {
                // already seen
                if (this.spendPrivateTooltipAmountSeen === this.amount) {
                    return false
                }

                const amount = Number.parseFloat(this.amount)

                if (!amount || Number.isNaN(amount)) {
                    return false
                }

                if (!Number.isInteger(amount)) {
                    return false
                }

                if (!this.amountConvertedToDenominations) {
                    return false
                }

                const { change: canNotSpendCompletely } = this.amountConvertedToDenominations

                return !canNotSpendCompletely
            }
        },

        watch: {
            amount (newVal, oldVal) {
                this.spendPrivateTooltipAmountSeen = null
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
        },

        methods: {
            ...mapActions({
                clearSpendForm: types.zerocoinspend.CLEAR_FORM,
                setSpendFormLabel: types.zerocoinspend.SET_FORM_LABEL,
                setSpendFormAddress: types.zerocoinspend.SET_FORM_ADDRESS,
                setSpendFormMints: types.zerocoinspend.SET_FORM_MINTS
            }),

            onCanSpendPrivateTooltipCancel () {
                this.spendPrivateTooltipAmountSeen = this.amount
            },

            onCanSpendPrivateTooltipSubmit () {
                if (!this.amountConvertedToDenominations) {
                    return
                }

                const { change: canNotSpendCompletely, toSpend } = this.amountConvertedToDenominations

                this.spendPrivateTooltipAmountSeen = this.amount

                if (canNotSpendCompletely) {
                    return
                }

                this.clearSpendForm()
                this.setSpendFormLabel(this.label)
                this.setSpendFormAddress(this.address)
                this.setSpendFormMints(toSpend)

                this.$router.push({ name: 'spend-zerocoin' })
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