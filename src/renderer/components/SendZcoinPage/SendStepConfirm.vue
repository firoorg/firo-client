<template>
    <section>
        <header>
            <h2>Confirm Payment</h2>
            <p>Nulla vitae elit libero, a pharetra augue Integer posuere erat.</p>
        </header>


        <div class="payment-fee-list">
            <h3>Payments</h3>
            <pending-payments :payments="pendingPayments"
                              class="pending-payments" />
            <fees-and-amount :amount="pendingPaymentsAmount"
                             :fee="fee"
                             :can-change-fee="true"
                             :on-change-fee="goToFeeSelector"
                             translation-namespace="todo" >
                <template slot-scope="payment">
                    {{ payment.label }}
                    {{ payment.amount }}
                </template>
            </fees-and-amount>
        </div>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import FeesAndAmount from '@/components/payments/FeesAndAmount'
    import PendingPayments from '@/components/payments/PendingPayments'

    export default {
        name: 'SendStepConfirm',

        components: {
            FeesAndAmount,
            PendingPayments
        },

        props: [
            'actions',
            'isConfirmed'
        ],

        computed: {
            ...mapGetters({
                pendingPayments: 'ZcoinPayment/pendingZcoinPayments',
                pendingPaymentsAmount: 'ZcoinPayment/pendingZcoinPaymentsAmount',
                fee: 'ZcoinPayment/selectedFee'
            })
        },

        methods: {
            goToFeeSelector () {
                console.log('going to fee selection')
                this.actions.goTo('selectFee')
            }
        }
    }
</script>

<style scoped>

</style>
