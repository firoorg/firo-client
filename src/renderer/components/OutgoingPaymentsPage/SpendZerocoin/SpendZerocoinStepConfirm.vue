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
                {{ spendFormAddress }}
            </current-mints>
            <!-- FeesAndAmount takes values in satoshi, so we convert it here, and then it gets converted back again.
                 This should be made consistent in a refactor. -->
            <fees-and-amount
                :amount="10**8 * spendFormAmount"
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

export default {
    name: 'SpendZerocoinStepConfirm',

    components: {
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
            spendFormAmount: 'ZerocoinSpend/spendFormAmount',
            spendFormAddress: 'ZerocoinSpend/spendFormAddress',
            spendFormLabel: 'ZerocoinSpend/spendFormLabel'
        })
    },

    mounted () {
        if (document.activeElement && typeof document.activeElement.blur == 'function') {
            document.activeElement.blur()
        }
    }
}
</script>

<style lang="scss" scoped>
    .fees-amount {
        margin-top: emRhythm(2);
    }
</style>
