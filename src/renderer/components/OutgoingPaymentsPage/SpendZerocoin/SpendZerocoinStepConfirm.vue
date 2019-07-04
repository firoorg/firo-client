<template>
    <section>
        <header>
            <h2 v-html="$t('send.private.flyout-confirm-private-send.title')" />
            <p v-html="$t('send.private.flyout-confirm-private-send.description')" />
        </header>


        <div class="payment-fee-list">
            {{ address }}

            <!-- FeesAndAmount takes values in satoshi, so we convert it here, and then it gets converted back again.
                 This should be made consistent in a refactor. -->
            <fees-and-amount
                :amount="10**8 * amount"
                :show-fee="false"
                translation-namespace="send.private.flyout-confirm-private-send"
            />
        </div>
    </section>
</template>

<script>
import FeesAndAmount from '@/components/payments/FeesAndAmount'

export default {
    name: 'SpendZerocoinStepConfirm',

    components: {
        FeesAndAmount
    },

    props: {
        address: {
            type: String,
            required: true
        },

        amount: {
            type: String,
            required: true
        }
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
