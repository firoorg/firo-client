<template>
    <section>
        <header>
            <h2 v-html="$t('mint.flyout-confirm-mint.title')"></h2>
            <p v-html="$t('mint.flyout-confirm-mint.description')"></p>
        </header>


        <div class="payment-fee-list">
            <current-mints :current-mints="denominations"
                           :show-progress="false" />
            <fees-and-amount :amount="currentDenominationCostsInSatoshi"
                             :fee="{ label: $t('mint.flyout-confirm-mint.label__fees'), amount: 100000 }"
                             :show-fee="true"
                             translation-namespace="mint.flyout-confirm-mint" />
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
