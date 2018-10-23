<template>
    <section class="connectivity-overlay overlay top _centered">
        <form class="grid" @submit.prevent="onSumbit">
            <main class="content">
                <div>
                    <h1>Incoming <br>Payment Request</h1>

                    <div v-if="alreadyFulfilled" class="already-fulfilled notice">
                        It seems as if you have <strong>already fulfilled</strong> this <em>Payment Request</em>
                    </div>

                    <div v-if="incomingPaymentRequest.message">
                        <h3>Message</h3>
                        <div v-html="messageFormatted" />
                    </div>
                    <div v-else class="no-message">
                        This <strong>Payment Request</strong> does not have a message attached. If it's unclear to you what this request is all about, please head back to the originator for clarification.
                    </div>

                    <fees-and-amount :show-fee="false"
                                     :amount="incomingPaymentRequest.amount"
                                     translation-namespace="receive.incoming-request"
                                     class="amount" />
                </div>
                <footer v-if="alreadyFulfilled">
                    <base-button type="submit"
                                 :is-outline="true">
                        <span>Pay anyway!</span>
                    </base-button>
                    <base-button @click="goToPaymentDetail" color="comet">
                        <span>View Payment</span>
                    </base-button>
                </footer>
                <footer v-else>
                    <base-button type="reset"
                                 :is-outline="true"
                                 @click="onCancel">
                        Cancel
                    </base-button>
                    <base-button type="submit" color="green">
                        <span>Pay Now!</span>
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
                incomingPaymentRequest: 'Clipboard/incomingPaymentRequest',
                hasAlreadySentToAddress: 'Address/hasAlreadySentToAddress'
            }),

            messageFormatted () {
                return nl2br(this.incomingPaymentRequest.message)
            },

            alreadyFulfilled () {
                return this.hasAlreadySentToAddress(this.incomingPaymentRequest.address)
            },

            submitButtonColor () {
                return this.alreadyFulfilled ? 'orange' : 'green'
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

            goToPaymentDetail () {
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
        max-width: emRhythm(60);
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

        h3 {
            color: $color--dark;
        }

        .already-fulfilled,
        .no-message {
            padding: emRhythm(2);
            @include bleed-h(4);
            color: $color--comet-dark;

            background: $color--polo-medium;
        }

        .already-fulfilled {
            background-color: $color--orange;
            color: $color--white;
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
