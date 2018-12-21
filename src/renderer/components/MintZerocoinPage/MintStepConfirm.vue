<template>
    <section>
        <header>
            <h2 v-html="$t('mint.flyout-confirm-mint.title')" />
            <p>{{ $tc('mint.flyout-confirm-mint.description', currentDenominationAmount) }}</p>
        </header>


        <div class="payment-fee-list">
            <current-mints
                :current-mints="denominations"
                :show-progress="false"
            />
            <fees-and-amount
                :amount="currentDenominationCostsInSatoshi"
                :fee="{ label: $t('mint.flyout-confirm-mint.label__fees'), amount: currentDenominationFees }"
                :show-fee="true"
                translation-namespace="mint.flyout-confirm-mint"
            />
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

    /*
    props: [
        'actions',
        'isConfirmed'
    ],
    */

    computed: {
        ...mapGetters({
            denominations: 'Mint/currentDenominationsFormatted',
            currentDenominationCostsInSatoshi: 'Mint/currentDenominationCostsInSatoshi',
            currentDenominationFees: 'Mint/currentDenominationFees',
            currentDenominationAmount: 'Mint/currentDenominationAmount'
        })
    }
}
</script>

<style lang="scss" scoped>
    .fees-amount {
        margin-top: emRhythm(2);
    }
</style>
