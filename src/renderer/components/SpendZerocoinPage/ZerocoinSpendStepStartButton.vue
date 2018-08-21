<template>
    <base-button :color="color"
                 @click.prevent="next"
                 :disabled="!canSubmit">
        Spend Now
    </base-button>
</template>

<script>
    import { mapActions } from 'vuex'
    import types from '~/types'

    export default {
        name: 'ZerocoinSpendStepStartButton',

        props: {
            canSubmit: {
                type: Boolean,
                default: false
            },
            color: {
                type: String
            }
        },

        methods: {
            ...mapActions({
                addPendingPayment: types.zcoinpayment.ADD_PENDING_ZCOIN_PAYMENTS
            }),

            next () {
                /*
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
                */

                this.$emit('next')
            }
        }
    }
</script>

<style scoped>

</style>