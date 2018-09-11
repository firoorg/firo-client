<template>
    <section>
        <header>
            <h2 v-html="$t('spend.detail-private-send.flyout-confirm-private-send.title')"></h2>
            <p v-html="$t('spend.detail-private-send.flyout-confirm-private-send.description')"></p>
        </header>


        <div class="payment-fee-list">
            <current-mints :current-mints="denominations"
                           :show-progress="false" />
            <fees-and-amount :amount="spendFormMintCostsInSatoshi"
                             :show-fee="false"
                             translation-namespace="spend.detail-private-send.flyout-confirm-private-send" />
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
