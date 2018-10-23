<template>
    <section class="send-zcoin-queue-form">
        <form class="send scrollable-height" @submit.prevent="submitForm">
            <div class="grid" ref="grid">
                <div class="form">
                    <header>
                        <div>
                            <h2 v-html="$t('send.public.detail-public-send.title')"></h2>
                            <p v-html="$t('send.public.detail-public-send.description')"></p>
                        </div>
                        <pending-payments-queue :is-disabled="false"
                                                :boundariesElement="$refs.grid" />
                    </header>

                    <send-zcoin-form :is-disabled="false"
                                     @form-validated="setFormValidationStatus"
                                     :boundaries-element="boundariesElement" />
                </div>

                <send-zcoin-steps :boundaries-element="boundariesElement"
                                  :form-is-valid="formSectionIsValid"
                                  :cleanup-form="cleanupForm"
                                  :update-transaction-fee="updateTransactionFee" />
            </div>
        </form>
    </section>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    // import isEmpty from 'lodash/isEmpty'
    import types from '~/types'

    import SendZcoinForm from '@/components/OutgoingPaymentsPage/SendZcoin/SendZcoinForm'
    import SendZcoinSteps from '@/components/OutgoingPaymentsPage/SendZcoin/SendZcoinSteps'

    // import FeesAndAmount from '@/components/FeesAndAmount'
    import SendConfirmDialog from '@/components/OutgoingPaymentsPage/SendZcoin/SendConfirmDialog'
    import SendFeeSelection from '@/components/OutgoingPaymentsPage/SendZcoin/SendFeeSelection'
    // import PendingPayments from '@/components/payments/PendingPayments'

    import SendConfirmationCheck from '@/components/Icons/SendConfirmationCheck'
    import PendingPaymentsQueue from '@/components/payments/PendingPaymentsQueue'

    export default {
        name: 'SendZcoin',
        components: {
            PendingPaymentsQueue,
            SendZcoinForm,
            SendZcoinSteps,
            SendConfirmationCheck,
            SendFeeSelection,
            SendConfirmDialog
            // FeesAndAmount,
            // PendingPayments,
        },

        $_veeValidate: {
            validator: 'new' // give me my own validator instance.
        },

        /*
        inject: [
            'mainRef'
        ],
        */
        props: {
            boundariesElement: {
                type: HTMLElement,
                required: false
            }
        },

        data () {
            return {
                validationFieldOrder: [
                    'label',
                    'amount',
                    'address'
                ],

                /*
                hasSent: false,
                pendingPayments: {},
                popoverStatus: '',
                popoverTimeout: null,
                containsUsedAddressOnSend: null,
                */
                // showSendConfirmation: false
                // showFeeSelection: false

                // --------- new --------

                formValidated: false
            }
        },

        computed: {
            ...mapGetters({
                currentFormIsEmpty: 'ZcoinPayment/createFormIsEmpty',
                hasPendingPayments: 'ZcoinPayment/hasPendingZcoinPayments',
                pendingPayments: 'ZcoinPayment/pendingZcoinPayments',
                selectedFee: 'ZcoinPayment/selectedFee',
                currentPassphrase: 'App/currentPassphrase',
                pendingPaymentsSize: 'ZcoinPayment/pendingZcoinPaymentsSize'
            }),
            formSectionIsValid () {
                return !!(this.formValidated || this.currentFormIsEmpty)
            }
            /*
            canSubmit () {
                // todo check (spend + fees) < available balance
                // return this.formValidated && !this.showFeeSelection && !this.hasSent
                return !!((this.formValidated || this.currentFormIsEmpty) && this.currentStepCanSubmit)
            }
            */
            // ---
        },

        watch: {
            currentStep: {
                handler (newVal, oldVal) {
                    window.dispatchEvent(new Event('resize'))
                    this.currentStepCanSubmit = !newVal
                },
                immediate: true
            },
            pendingPaymentsSize (newVal, oldVal) {
                this.updateTransactionFee()
            }
        },

        methods: {
            ...mapActions({
                clearForm: types.zcoinpayment.CLEAR_FORM
            }),

            setFormValidationStatus (isValid) {
                this.formValidated = isValid
            },

            resetValidator () {
                this.$nextTick(() => this.$validator.reset())
            },

            cleanupForm () {
                console.log('cleaning up...')
                this.clearForm()

                // this.hasSent = false
                // this.containsUsedAddressOnSend = null
                this.resetValidator()
            },

            updateTransactionFee () {
                this.$store.dispatch(types.zcoinpayment.CALC_TX_FEE, {
                    payments: this.pendingPayments,
                    fee: this.selectedFee.amount
                })
            },

            submitForm () {
                if (!this.hasPendingPayments) {
                    console.log('no pending payments')
                    return
                }

                if (!this.selectedFee) {
                    console.log('no fee selected')
                    return
                }

                if (!this.currentPassphrase) {
                    console.log('no passphrase')
                    return
                }

                this.$store.dispatch(types.zcoinpayment.SEND_ZCOIN, {
                    payments: this.pendingPayments,
                    fee: this.selectedFee.amount,
                    auth: {
                        passphrase: this.currentPassphrase
                    }
                })
                this.resetValidator()
                /*
                if (!this.formSectionIsValid) {
                    return
                }
                */
            }
        }
    }
</script>

<style lang="scss" scoped>
    .send-zcoin-queue-form {
        height: 100vh;

        header {
            // margin-left: emRhythm(3, $ms-up2);
            margin-bottom: emRhythm(7);

            @include h2-with-description(inherit, $color--polo-dark);
        }
    }

    .send {
        padding: emRhythm(5) emRhythm(6);
        height: 100vh;
        box-sizing: border-box;
    }

    .grid {
        display: grid;
        grid-template-rows: auto auto;
        height: 100%;
        @include bleed-h(3);
    }

    .form {
        //align-self: self-end;

        & > header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        ::selection {
            color: $color--white-light;
            background: $color--dark;
        }
    }

    .confirmation-popover-content-wrap {
        max-width: emRhythm(50);

        /deep/ .pending-payments {
            margin-bottom: emRhythm(3);
        }

        /deep/ .payment-fee-list h3 {
            @include setType(2);
            font-style: italic;
            margin: emRhythm(2) 0 emRhythm(1);
        }
    }

    fieldset {
        margin: 0;
        padding: 0;
        height: 100%;
        border: none;

        &[disabled] {
            input[type="text"],
            select,
            .message {
                pointer-events: none;
            }
        }
    }

    /*.confirmation-popover {
        display: inline-block;
    }*/

    .debug {
        align-self: end;
    }
</style>
