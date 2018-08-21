<template>
    <section>
        <header>
            <h2>Confirm Payment</h2>
            <p>Nulla vitae elit libero, a pharetra augue Integer posuere erat.</p>
        </header>


        <div class="payment-fee-list">
            <h3>Payments</h3>
            <!--
            <fees-and-amount :amount="pendingPaymentsAmount"
                             :show-fee="false">
                <template slot-scope="payment">
                    {{ payment.label }}
                    {{ payment.amount }}
                </template>
            </fees-and-amount>
            -->
        </div>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import FeesAndAmount from '@/components/payments/FeesAndAmount'

    export default {
        name: 'SpendZerocoinStepConfirm',

        components: {
            FeesAndAmount
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
        }
    }
</script>

<style scoped>

</style>