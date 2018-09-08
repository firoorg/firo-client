<template>
    <section class="spend-zerocoin">
        <div class="scrollable-height">
            <section class="payment-list">
                <spend-zerocoin-from-clipboard-popover :boundaries-element="boundariesElement">
                    <h1>
                        Send<br>
                        Zcoin
                    </h1>
                </spend-zerocoin-from-clipboard-popover>

                <outgoint-payments-list />
            </section>
        </div>
        <section class="payment-detail">
            <spend-zerocoin :boundaries-element="boundariesElement" />
        </section>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    // import { convertToCoin } from '#/lib/convert'

    import SpendZerocoin from '@/components/SpendZerocoinPage/Spend'

    import SpendZerocoinFromClipboardPopover from '@/components/SpendZerocoinPage/SpendZerocoinFromClipboardPopover'
    import OutgointPaymentsList from '@/components/payments/OutgointPaymentsList'

    export default {
        name: 'SpendZerocoinPage',
        components: {
            OutgointPaymentsList,
            SpendZerocoinFromClipboardPopover,
            SpendZerocoin
        },

        props: [
            'boundariesElement'
        ],

        data () {
            return {
                selectedPaymentRequest: null
            }
        },

        computed: {
            ...mapGetters({
                clipboardNotified: 'Clipboard/isNotified',
                clipboardAddress: 'Clipboard/address',
                clipboardAmount: 'Clipboard/amount'
            })
        }
    }
</script>

<style lang="scss" scoped>
    .spend-zerocoin {
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 1fr $detail-view--min-width;
        // background-image: linear-gradient(to top right, $color--dark, $color--comet-dark-mixed);
        //grid-column-gap: emRhythm(5);

        .scrollable {
            position: relative;
            z-index: 1;
            box-sizing: border-box;
            overflow: scroll;
            height: 100vh;
        }
    }

    .payment-list,
    .payment-detail {
        position: relative;
    }

    .payment-list {
        padding: emRhythm(5) emRhythm(4);
    }

    .payment-detail {
        //background: $gradient--comet-dark-horizontal;
        //background: $gradient--polo-horizontal;
        background: $color--white;
    }

    .create-wrap {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        width: 100%;

        .create-payment-request {
            width: 100%;
        }
    }
</style>
