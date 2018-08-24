<template>
    <section>
        <header>
            <h2>Confirm Payment</h2>
            <p>Nulla vitae elit libero, a pharetra augue Integer posuere erat.</p>
        </header>


        <div class="payment-fee-list">
            <current-mints :current-mints="denominations"
                           :show-progress="false" />
            <fees-and-amount :amount="spendFormMintCostsInSatoshi"
                             :show-fee="false" />
        </div>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'

    import FeesAndAmount from '@/components/payments/FeesAndAmount'
    import CurrentMints from '@/components/payments/CurrentMints'

    export default {
        name: 'SpendZerocoinStepConfirm',

        components: {
            CurrentMints,
            FeesAndAmount
        },

        props: [
            'actions',
            'isConfirmed'
        ],

        computed: {
            ...mapGetters({
                denominations: 'ZerocoinSpend/spendFormMintsFormatted',
                spendFormMintCostsInSatoshi: 'ZerocoinSpend/spendFormMintCostsInSatoshi'
            })
        }
    }
</script>

<style lang="scss" scoped>
    .fees-amount {
        margin-top: emRhythm(2);
    }
</style>