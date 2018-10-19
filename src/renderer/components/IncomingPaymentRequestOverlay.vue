<template>
    <section class="connectivity-overlay overlay top _centered">
        <form class="grid" @submit.prevent="onSumbit">
            <main class="content">
                <div>
                    <h1>Incoming <br>Payment Request</h1>

                    <div v-if="incomingPaymentRequest.message" v-html="messageFormatted" />
                    <div v-else class="no-message">
                        This Payment Request does not have a message attached. If it's unclear to you head back to the
                        originator of the request for clarification.
                    </div>

                    <fees-and-amount :show-fee="false"
                                     :amount="incomingPaymentRequest.amount"
                                     translation-namespace="receive.incoming-request"
                                     class="amount" />
                </div>
                <footer>
                    <base-button type="reset"
                                 :is-outline="true"
                                 @click="onCancel">
                        Cancel
                    </base-button>
                    <base-button type="submit"
                                 color="green">
                        Pay Now!
                    </base-button>
                </footer>
            </main>
        </form>
    </section>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import types from '~/types'
    import { convertToCoin } from '#/lib/convert'
    import { nl2br } from '@/utils/format'

    import FeesAndAmount from '@/components/payments/FeesAndAmount'

    export default {
        name: 'IncomingPaymentRequestOverlay',
        components: {
            FeesAndAmount
        },

        computed: {
            ...mapGetters({
                incomingPaymentRequest: 'Clipboard/incomingPaymentRequest'
            }),

            messageFormatted () {
                return nl2br(this.incomingPaymentRequest.message)
            }
        },

        methods: {
            ...mapActions({
                setFormAddress: types.zcoinpayment.SET_FORM_ADDRESS,
                setFormAmount: types.zcoinpayment.SET_FORM_AMOUNT,
                markAsNotified: types.clipboard.MARK_AS_NOTIFIED
            }),

            onCancel () {
                this.markAsNotified()
            },

            onSumbit () {
                if (!this.incomingPaymentRequest) {
                    this.markAsNotified()
                    return
                }

                this.setFormAddress(this.incomingPaymentRequest.address)

                if (this.incomingPaymentRequest.amount) {
                    this.setFormAmount(convertToCoin(this.incomingPaymentRequest.amount))
                }

                this.markAsNotified()
                this.$router.push({
                    name: 'send-zcoin'
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .overlay .content {
        @include glow-huge-box();
        background: $color--polo-light;
        padding: emRhythm(7) emRhythm(9) 0;
        max-width: emRhythm(55);
        color: $color--comet;
        text-shadow: none;

        & > div {
            padding: 0 emRhythm(3);

            h1 {
                margin-bottom: emRhythm(2);
                color: $color--comet-dark-mixed;
            }
        }

        .amount {
            margin-top: emRhythm(3);
            color: $color--comet-dark-mixed;
        }

        footer {
            @include divider-top-with-gradient();
            // padding-bottom: 0;
            display: flex;
            justify-content: center;

            /deep/ button + button,
            /deep/ .popover + button {
                margin-left: emRhythm(2);
            }
        }
    }
</style>
