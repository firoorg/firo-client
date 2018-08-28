<template>
    <div class="button-wrap">
        <template v-if="!currentStep">
            <spend-zerocoin-step-start-button :can-submit="canStart"
                                    :color="submitButtonColor"
                                    @pending-payment-added="cleanupForm"
                                    @next="() => onStepChange('confirm')" />
        </template>
        <template v-else-if="currentStep !== 'done'">
            <base-button v-if="currentStepCanCancel"
                         color="red"
                         :is-dark="true"
                         :is-outline="true"
                         @click.prevent="onCancel">
                <span>Cancel</span>
            </base-button>
        </template>

        <multi-step-popover-buttons :steps="steps"
                                    :current-step="currentStep"
                                    @step-change="onStepChange"
                                    @can-submit="onStepCanSubmit"
                                    @can-cancel="onStepCanCancel"
                                    @is-confirmed="onConfirm"
                                    :placement="currentPlacement"
                                    :component-props="currentComponentProps"
                                    :is-open="currentStepIsOpen"
                                    :boundaries-element="boundariesElement"
                                    :popover-class="currentPopoverClass">
            <template slot="step-confirm" slot-scope="{ actions }">
                <spend-zerocoin-step-confirm-buttons :actions="actions"
                                           :color="submitButtonColor"
                                           :can-submit="canSubmit"
                                           :is-timer-done="isConfirmed">
                </spend-zerocoin-step-confirm-buttons>
            </template>
            <template slot="step-passphrase" slot-scope="{ actions }">
                <payment-step-passphrase-buttons :actions="actions"
                                              :color="submitButtonColor"
                                              :is-dark="true"
                                              :can-submit="canSubmit">
                    Unlock and spend
                </payment-step-passphrase-buttons>
            </template>
            <template slot="step-done" slot-scope="{ actions }">
                <base-button :color="submitButtonColor" :is-dark="true" :disabled="true">
                    <span v-if="isLoading">Sending...</span>
                    <span v-else>Sent!</span>
                </base-button>
            </template>
        </multi-step-popover-buttons>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import GuideMixin from '@/mixins/GuideMixin'
    import types from '~/types'

    import MultiStepPopoverButtons from '@/components/Notification/MultiStepPopoverButtons'
    import SpendZerocoinStepConfirm from '@/components/SpendZerocoinPage/SpendZerocoinStepConfirm'
    import SendAddToQueueButton from '@/components/SendZcoinPage/SendAddToQueueButton'
    import SpendZerocoinStepStartButton from '@/components/SpendZerocoinPage/SpendZerocoinStepStartButton'
    import SpendZerocoinStepConfirmButtons from '@/components/SpendZerocoinPage/SpendZerocoinStepConfirmButtons'
    import PaymentStepPassphrase from '@/components/payments/PaymentStepPassphrase'
    import PaymentStepPassphraseButtons from '@/components/payments/PaymentStepPassphraseButtons'
    import StepResponseStatus from '@/components/payments/StepResponseStatus'

    export default {
        name: 'SpendZerocoinSteps',

        mixins: [
            GuideMixin
        ],

        components: {
            MultiStepPopoverButtons,
            SendAddToQueueButton,
            SpendZerocoinStepStartButton,
            SpendZerocoinStepConfirm,
            SpendZerocoinStepConfirmButtons,
            PaymentStepPassphrase,
            PaymentStepPassphraseButtons,
            StepResponseStatus
        },

        props: {
            formIsValid: {
                type: Boolean,
                required: true
            },
            cleanupForm: {
                type: Function,
                required: true
            }
        },

        data () {
            return {
                steps: {
                    confirm: {
                        component: SpendZerocoinStepConfirm,
                        isOpen () {
                            console.log('is open ->', this, this.currentStepCanSubmit)
                            // return this.currentStepCanSubmit
                            return true
                        },
                        placement () {
                            return this.currentStepCanSubmit ? 'top-end' : 'top'
                        },
                        props () {
                            return {
                                isTimerDone: this.isConfirmed
                            }
                        }
                    },
                    passphrase: {
                        component: PaymentStepPassphrase,
                        isOpen () {
                            return true
                        }
                    },

                    done: {
                        component: StepResponseStatus,
                        isOpen () {
                            return !this.isLoading && !this.isDone
                        },
                        placement () {
                            return 'top'
                        },
                        props () {
                            return {
                                isLoading: this.isLoading,
                                isValid: this.responseIsValid,
                                isError: this.responseIsError,
                                error: this.responseError,
                                onAutoClose: () => {
                                    this.onCancel()
                                }
                            }
                        }
                    }

                },
                currentStepCanSubmit: false,
                currentStepCanCancel: false,
                isConfirmed: false
            }
        },

        computed: {
            ...mapGetters({
                isLoading: 'ZerocoinSpend/isLoading',
                responseIsValid: 'ZerocoinSpend/spendZerocoinResponseIsValid',
                responseIsError: 'ZerocoinSpend/spendZerocoinResponseIsError',
                responseError: 'ZerocoinSpend/spendZerocoinResponseError',
                // currentFormAmountAsSatoshi: 'ZcoinPayment/createFormAmount',
                currentFormAddress: 'ZerocoinSpend/spendFormAddress',
                // currentFormIsEmpty: 'ZcoinPayment/createFormIsEmpty',
                hasAlreadySentToAddress: 'Address/hasAlreadySentToAddress'
            }),

            canStart () {
                return this.formIsValid
            },

            canSubmit () {
                return this.canStart && this.currentStepCanSubmit
            },

            isUsedAddress () {
                return this.hasAlreadySentToAddress(this.currentFormAddress)
            },

            submitButtonColor () {
                if (this.isUsedAddress) {
                    return 'orange'
                }

                if (this.responseIsError) {
                    return 'red'
                }

                return 'green'
            }
        },

        methods: {
            onStepCanSubmit (newVal) {
                console.log('on can submit!', newVal)
                this.currentStepCanSubmit = newVal
            },

            onStepCanCancel (newVal) {
                console.log('on can cancel!', newVal)
                this.currentStepCanCancel = newVal
            },

            onConfirm (newVal) {
                console.log('confirmed!!!', newVal)
                this.isConfirmed = newVal
            },

            onCancel () {
                this.isConfirmed = false
                this.currentStep = null
                this.currentStepCanSubmit = false
                this.currentStepCanCancel = false

                this.$store.dispatch(types.zerocoinspend.CLEAR_SPEND_ZEROCOIN_RESPONSE)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .button-wrap {
        align-self: self-end;
        text-align: center;

        .v-popover {
            display: inline-block;
        }

        button + button,
        button + .v-popover {
            margin-left: emRhythm(1)
        }
    }
</style>