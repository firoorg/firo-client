<template>
    <section>
        <header>
            <h2>Confirm Mint</h2>
            <p>Nulla vitae elit libero, a pharetra augue Integer posuere erat.</p>
        </header>


        <div class="payment-fee-list">
            <current-mints :current-mints="denominations"
                           :show-progress="false" />
            <fees-and-amount :amount="currentDenominationCostsInSatoshi"
                             :fee="{ label: 'Fees', amount: 100000 }"
                             :show-fee="true" />
        </div>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'

    import FeesAndAmount from '@/components/payments/FeesAndAmount'
    import CurrentMints from '@/components/payments/CurrentMints'

    export default {
        name: 'MintStepConfirm',

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
                denominations: 'Mint/currentDenominationsFormatted',
                currentDenominationCostsInSatoshi: 'Mint/currentDenominationCostsInSatoshi'
                // todo current denomination fees
            })
        }
    }
</script>

<style lang="scss" scoped>
    .fees-amount {
        margin-top: emRhythm(2);
    }
</style>
