<template>
    <base-button :is-outline="true"
                 @click.prevent="addToQueue"
                 :disabled="!canSubmit">
        <span v-if="!hasPendingPayments">Send Later</span>
        <span v-else>Add To Queue</span>
    </base-button>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import types from '~/types'

    export default {
        name: 'SendAddToQueueButton',

        props: {
            canSubmit: {
                type: Boolean,
                default: false
            }
        },

        computed: {
            ...mapGetters({
                hasPendingPayments: 'ZcoinPayment/hasPendingZcoinPayments',
                formLabel: 'ZcoinPayment/createFormLabel',
                formAmount: 'ZcoinPayment/createFormAmount',
                formAddress: 'ZcoinPayment/createFormAddress'
            })
        },

        methods: {
            ...mapActions({
                addPendingPayment: types.zcoinpayment.ADD_PENDING_ZCOIN_PAYMENTS
            }),

            addToQueue () {
                this.addPendingPayment({
                    label: this.formLabel,
                    amount: this.formAmount,
                    address: this.formAddress
                })

                this.$emit('pending-payment-added', {
                    address: this.formAddress
                })
            }
        }

    }
</script>

<style scoped>

</style>