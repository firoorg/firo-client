<template>
    <base-button :color="color"
                 @click.prevent="next"
                 :disabled="!canSubmit">
        <span v-if="!hasPendingPayments">{{ $tc('send.public.detail-public-send.button__send--primary', 1) }}</span>
        <span v-else>{{ $tc('send.public.detail-public-send.button__send--primary', paymentsToSend, { count: paymentsToSend }) }}</span>
    </base-button>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import types from '~/types'

    export default {
        name: 'SendStepStartButton',

        props: {
            canSubmit: {
                type: Boolean,
                default: false
            },
            color: {
                type: String
            }
        },

        computed: {
            ...mapGetters({
                hasPendingPayments: 'ZcoinPayment/hasPendingZcoinPayments',
                pendingPaymentsSize: 'ZcoinPayment/pendingZcoinPaymentsSize',
                formLabel: 'ZcoinPayment/createFormLabel',
                formAmount: 'ZcoinPayment/createFormAmount',
                formAddress: 'ZcoinPayment/createFormAddress',
                formIsEmpty: 'ZcoinPayment/createFormIsEmpty'
            }),

            paymentsToSend () {
                return this.formIsEmpty ? this.pendingPaymentsSize : this.pendingPaymentsSize + 1
            }
        },

        methods: {
            ...mapActions({
                addPendingPayment: types.zcoinpayment.ADD_PENDING_ZCOIN_PAYMENTS
            }),

            next () {
                if (!this.formIsEmpty) {
                    this.addPendingPayment({
                        label: this.formLabel,
                        amount: this.formAmount,
                        address: this.formAddress
                    })

                    this.$emit('pending-payment-added', {
                        address: this.formAddress
                    })
                }

                this.$emit('next')
            }
        }
    }
</script>

<style scoped>

</style>
