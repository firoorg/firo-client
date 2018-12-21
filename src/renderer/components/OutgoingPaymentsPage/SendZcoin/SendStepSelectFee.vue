<template>
    <send-fee-selection
        :selected-fee="fee.key"
        @fee-change="updateFee"
    />
</template>

<script>
import { mapGetters } from 'vuex'
import SendFeeSelection from '@/components/OutgoingPaymentsPage/SendZcoin/SendFeeSelection'
import types from '~/types'

export default {
    name: 'SendStepSelectFee',

    components: {
        SendFeeSelection
    },

    props: {
        actions: {
            type: Object,
            required: true
        },
        // 'confirmed',
        updateTransactionFee: {
            type: Function,
            required: true
        }
    },

    computed: {
        ...mapGetters({
            fee: 'ZcoinPayment/selectedFee',
            pendingPayments: 'ZcoinPayment/pendingZcoinPayments'
        })
    },

    beforeCreate () {
        this.$parent.$emit('can-submit', false)
    },

    methods: {
        updateFee (newVal) {
            console.log('update fee', this.fee.key, newVal)
            const feeChanged = this.fee.key !== newVal.key

            this.$store.dispatch(types.zcoinpayment.SET_FEE, newVal)
            console.log('direct', this.fee.amount)

            // we need to defer calculation into the next tick
            // as we have to wait that the `newVal` gets synced down to components
            this.$nextTick(() => {
                console.log('sending fee + payments to zcoind to get estimated total fee')
                this.updateTransactionFee()

                console.log('changed fee', feeChanged)

                this.$parent.$emit('is-confirmed', !feeChanged)
                this.$parent.$emit('can-submit', !feeChanged)
                this.$parent.$emit('can-cancel', !feeChanged)

                this.actions.goTo('confirm')
            })
        }
    }
}
</script>

<style scoped>

</style>
