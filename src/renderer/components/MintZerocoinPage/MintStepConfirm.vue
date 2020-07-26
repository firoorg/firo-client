<template>
    <div class="content-wrapper">
        <header>
            <h2 v-html="$t('mint.flyout-confirm-mint.title')" />
            <p>{{ $tc('mint.flyout-confirm-mint.description', mintAmount) }}</p>
        </header>

        <div class="payment-fee-list">
            <current-mints
                :current-mints="mints"
                :show-progress="false"
            />
            <fees-and-amount
                :amount="mintAmount"
                :fee="{ label: $t('mint.flyout-confirm-mint.label__fees'), amount: mintFees }"
                :show-fee="true"
                translation-namespace="mint.flyout-confirm-mint"
            />
        </div>
    </div>
</template>

<script>
import FeesAndAmount from '@/components/payments/FeesAndAmount'
import CurrentMints from '@/components/payments/CurrentMints'

export default {
    name: 'MintStepConfirm',

    components: {
        CurrentMints,
        FeesAndAmount
    },

    props: {
        mintAmount: {
            type: Number,
            required: true
        },

        mintFees: {
            type: Number,
            required: true
        },

        mints: {
            // {[denomination: number]: number}
            type: Object,
            required: true
        }
    },
}
</script>

<style lang="scss" scoped>
    .fees-amount {
        margin-top: emRhythm(2);
    }
</style>
