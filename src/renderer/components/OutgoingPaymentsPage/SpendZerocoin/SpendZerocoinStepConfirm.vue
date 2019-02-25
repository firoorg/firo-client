<template>
    <section>
        <header>
            <h2 v-html="$t('send.private.flyout-confirm-private-send.title')" />
            <p v-html="$t('send.private.flyout-confirm-private-send.description')" />
        </header>


        <div class="payment-fee-list">
            <current-mints
                :current-mints="denominations"
                :show-progress="false"
            >
                <validate-address-button
                    :address="spendFormAddress"
                    :label="spendFormLabel"
                    :amount="costs"
                />
            </current-mints>
            <fees-and-amount
                :amount="spendFormMintCostsInSatoshi"
                :show-fee="false"
                translation-namespace="send.private.flyout-confirm-private-send"
            />
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { convertToCoin } from '#/lib/convert'

import FeesAndAmount from '@/components/payments/FeesAndAmount'
import CurrentMints from '@/components/payments/CurrentMints'
import ValidateAddressButton from '@/components/payments/ValidateAddressButton'

export default {
    name: 'SpendZerocoinStepConfirm',

    components: {
        ValidateAddressButton,
        CurrentMints,
        FeesAndAmount
    },

    /*
    props: {
        actions: {
            type: Object,
            required: true
        },
        isConfirmed
    },
    */

    computed: {
        ...mapGetters({
            denominations: 'ZerocoinSpend/spendFormMintsFormatted',
            spendFormMintCostsInSatoshi: 'ZerocoinSpend/spendFormMintCostsInSatoshi',
            spendFormAddress: 'ZerocoinSpend/spendFormAddress',
            spendFormLabel: 'ZerocoinSpend/spendFormLabel'
        }),

        costs () {
            return convertToCoin(this.spendFormMintCostsInSatoshi)
        }
    }
}
</script>

<style lang="scss" scoped>
    .fees-amount {
        margin-top: emRhythm(2);
    }
</style>
