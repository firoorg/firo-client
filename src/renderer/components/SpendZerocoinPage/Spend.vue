<template>
    <section class="spend-zerocoin-queue-form">
        <form class="send scrollable-height" @submit.prevent="submitForm">
            <div class="grid" ref="grid">
                <div class="form">
                    <header>
                        <div>
                            <h2 v-html="$t('spend.detail-private-send.title__private-send')"></h2>
                            <p v-html="$t('spend.detail-private-send.description')"></p>
                        </div>
                    </header>

                    <spend-zerocoin-form :is-disabled="false"
                                         @form-validated="setFormValidationStatus"
                                         :boundaries-element="boundariesElement" />
                </div>
                <section class="checkout has-divider">
                    <!--<div class="">-->
                    <fees-and-amount class="fees-and-amount"
                                     :amount="spendFormMintCostsInSatoshi"
                                     :show-fee="false"
                                     translation-namespace="spend.detail-private-send" />
                    <!--</div>-->
                    <spend-zerocoin-steps :boundaries-element="boundariesElement"
                                          :form-is-valid="formSectionIsValid"
                                          :cleanup-form="cleanupForm" />
                </section>
            </div>
        </form>
    </section>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    // import isEmpty from 'lodash/isEmpty'
    import types from '~/types'

    import SpendZerocoinForm from '@/components/SpendZerocoinPage/SpendZerocoinForm'
    import FeesAndAmount from '@/components/payments/FeesAndAmount'
    import SpendZerocoinSteps from '@/components/SpendZerocoinPage/SpendZerocoinSteps'

    // import FeesAndAmount from '@/components/FeesAndAmount'
    import SendConfirmDialog from '@/components/SendZcoinPage/SendConfirmDialog'
    import SendFeeSelection from '@/components/SendZcoinPage/SendFeeSelection'
    // import PendingPayments from '@/components/payments/PendingPayments'

    import SendConfirmationCheck from '@/components/Icons/SendConfirmationCheck'

    export default {
        name: 'SpendZerocoin',
        components: {
            FeesAndAmount,
            SpendZerocoinForm,
            SpendZerocoinSteps,
            SendConfirmationCheck,
            SendFeeSelection,
            SendConfirmDialog
        },

        $_veeValidate: {
            validator: 'new' // give me my own validator instance.
        },

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

                formValidated: false
            }
        },

        computed: {
            ...mapGetters({
                currentPassphrase: 'App/currentPassphrase',
                spendFormLabel: 'ZerocoinSpend/spendFormLabel',
                spendFormAddress: 'ZerocoinSpend/spendFormAddress',
                spendFormMintsFormatted: 'ZerocoinSpend/spendFormMintsFormatted',
                spendFormMintCostsInSatoshi: 'ZerocoinSpend/spendFormMintCostsInSatoshi'
            }),
            formSectionIsValid () {
                return this.formValidated
            }
        },

        watch: {
            currentStep: {
                handler (newVal, oldVal) {
                    window.dispatchEvent(new Event('resize'))
                },
                immediate: true
            }
        },

        methods: {
            ...mapActions({
                clearForm: types.zerocoinspend.CLEAR_FORM
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

                this.resetValidator()
            },

            submitForm () {
                if (!this.currentPassphrase) {
                    console.log('no passphrase')
                    return
                }

                this.$store.dispatch(types.zerocoinspend.SPEND_ZEROCOIN, {
                    address: this.spendFormAddress,
                    denominations: this.spendFormMintsFormatted,
                    label: this.spendFormLabel,
                    auth: {
                        passphrase: this.currentPassphrase
                    }
                })

                this.cleanupForm()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .spend-zerocoin-queue-form {
        height: 100vh;
        background: $color--comet-dark;

        color: $color--white;

        header {
            // margin-left: emRhythm(3, $ms-up2);
            margin-bottom: emRhythm(7);
            margin-left: emRhythm(3, $ms-up2);
            margin-bottom: emRhythm(7, $ms-up2);

            @include h2-with-description(inherit, $color--polo-dark);

            p {
                color: $color--white-light;
            }
        }
    }

    .send {
        padding: emRhythm(5) emRhythm(6);
        height: 100vh;
        box-sizing: border-box;
    }

    .grid {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        //display: grid;
        //grid-template-rows: auto auto;
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
        border: none;

        &[disabled] {
            input[type="text"],
            select,
            .message {
                pointer-events: none;
            }
        }
    }

    .debug {
        align-self: end;
    }

    .has-divider {
        margin-top: emRhythm(3);
        @include dark-divider-top-with-gradient();
        padding-bottom: 0;

        .fees-and-amount {
            margin-top: 0;
        }
    }
</style>
