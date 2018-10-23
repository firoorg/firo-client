<template>
    <div class="button-wrap">
        <template v-if="!currentStep">
            <send-add-to-queue-button :can-submit="canAddToQueue"
                                      @pending-payment-added="cleanupForm" />
            <send-step-start-button :can-submit="canStart"
                                    :color="submitButtonColor"
                                    @pending-payment-added="cleanupForm"
                                    @next="() => onStepChange('confirm')" />
        </template>
        <template v-else-if="currentStep !== 'done'">
            <base-button v-if="currentStepCanCancel"
                         color="red"
                         :is-outline="true"
                         @click.prevent="onCancel">
                <span>{{ $t('send.public.flyout-confirm-send.button__cancel--secondary') }}</span>
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
                <send-step-confirm-buttons :actions="actions"
                                           :color="submitButtonColor"
                                           :can-submit="canSubmit"
                                           :is-timer-done="isConfirmed">
                </send-step-confirm-buttons>
            </template>
            <template slot="step-selectFee" slot-scope="{ actions }">
                <send-step-confirm-buttons :actions="actions"
                                           :color="submitButtonColor"
                                           :can-submit="canSubmit"
                                           :is-timer-done="isConfirmed">
                </send-step-confirm-buttons>
            </template>
            <template slot="step-passphrase" slot-scope="{ actions }">
                <payment-step-passphrase-buttons :actions="actions"
                                              :color="submitButtonColor"
                                              :can-submit="canSubmit">
                    {{ $t('send.public.flyout-confirm-send.button__unlock-and-send--primary') }}
                </payment-step-passphrase-buttons>
            </template>
            <template slot="step-done" slot-scope="{ actions }">
                <base-button :color="submitButtonColor" :disabled="true">
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
    import SendStepConfirm from '@/components/OutgoingPaymentsPage/SendZcoin/SendStepConfirm'
    import SendAddToQueueButton from '@/components/OutgoingPaymentsPage/SendZcoin/SendAddToQueueButton'
    import SendStepStartButton from '@/components/OutgoingPaymentsPage/SendZcoin/SendStepStartButton'
    import SendStepConfirmButtons from '@/components/OutgoingPaymentsPage/SendZcoin/SendStepConfirmButtons'
    import SendStepSelectFee from '@/components/OutgoingPaymentsPage/SendZcoin/SendStepSelectFee'
    import PaymentStepPassphrase from '@/components/payments/PaymentStepPassphrase'
    import PaymentStepPassphraseButtons from '@/components/payments/PaymentStepPassphraseButtons'
    import StepResponseStatus from '@/components/payments/StepResponseStatus'

    export default {
        name: 'SendZcoinSteps',

        mixins: [
            GuideMixin
        ],

        components: {
            MultiStepPopoverButtons,
            SendAddToQueueButton,
            SendStepStartButton,
            SendStepConfirm,
            SendStepConfirmButtons,
            SendStepSelectFee,
            PaymentStepPassphrase,
            PaymentStepPassphraseButtons,
            StepResponseStatus
        },

        props: {
            boundariesElement: {
                type: HTMLElement,
                required: false
            },
            formIsValid: {
                type: Boolean,
                required: true
            },
            cleanupForm: {
                type: Function,
                required: true
            },
            updateTransactionFee: {
                type: Function,
                required: true
            }
        },

        data () {
            return {
                steps: {
                    confirm: {
                        component: SendStepConfirm,
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
                    selectFee: {
                        component: SendStepSelectFee,
                        isOpen () {
                            return true
                        },
                        placement () {
                            return this.isConfirmed ? 'top-end' : 'top'
                        },
                        props () {
                            return {
                                updateTransactionFee: this.updateTransactionFee,
                                isConfirmed: this.isConfirmed
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
                            return !this.isLoading
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
                currentStep: '',
                currentStepCanSubmit: false,
                currentStepCanCancel: false,
                isConfirmed: false
            }
        },

        computed: {
            ...mapGetters({
                isLoading: 'ZcoinPayment/isLoading',
                responseIsValid: 'ZcoinPayment/sendZcoinResponseIsValid',
                responseIsError: 'ZcoinPayment/sendZcoinResponseIsError',
                responseError: 'ZcoinPayment/sendZcoinResponseError',
                fee: 'ZcoinPayment/selectedFee',
                currentFormAmountAsSatoshi: 'ZcoinPayment/createFormAmount',
                currentFormAddress: 'ZcoinPayment/createFormAddress',
                currentFormIsEmpty: 'ZcoinPayment/createFormIsEmpty',
                hasAlreadySentToAddress: 'Address/hasAlreadySentToAddress',
                pendingPayments: 'ZcoinPayment/pendingZcoinPayments',
                hasPendingPayments: 'ZcoinPayment/hasPendingZcoinPayments'
            }),

            canStart () {
                return (
                    (this.currentFormIsEmpty && this.hasPendingPayments) ||
                    (!this.currentFormIsEmpty && this.formIsValid)
                )
            },

            canSubmit () {
                return this.canStart && this.currentStepCanSubmit
            },

            canAddToQueue () {
                return !this.currentFormIsEmpty && this.formIsValid
            },

            currentPlacement () {
                const current = this.steps[this.currentStep]

                return current && current.placement ? current.placement.bind(this)() : 'top-end'
            },

            currentStepIsOpen () {
                if (!this.steps[this.currentStep]) {
                    return false
                }

                if (!this.steps[this.currentStep].isOpen) {
                    return false
                }

                return this.steps[this.currentStep].isOpen.bind(this)()
            },

            currentComponentProps () {
                if (!this.steps[this.currentStep]) {
                    return null
                }

                if (!this.steps[this.currentStep].props) {
                    return null
                }

                return this.steps[this.currentStep].props.bind(this)()
            },

            currentPopoverClass () {
                return [this.submitButtonColor, `${'step'}-${this.currentStep}`].join(' ')
            },

            containsUsedAddress () {
                /*
                if (this.containsUsedAddressOnSend !== null) {
                    return this.containsUsedAddressOnSend
                }
                */

                if (this.hasAlreadySentToAddress(this.currentFormAddress)) {
                    return true
                }

                for (let payment of this.pendingPayments) {
                    const { address } = payment
                    console.log('let address in this.pendingPayments', address)
                    const usedAddress = this.hasAlreadySentToAddress(address)

                    if (usedAddress) {
                        return true
                    }
                }

                return false
            },

            submitButtonColor () {
                if (this.containsUsedAddress) {
                    return 'orange'
                }

                if (this.responseIsError) {
                    return 'red'
                }

                return 'green'
            }
        },

        watch: {
            currentStep: {
                handler (newVal, oldVal) {
                    window.dispatchEvent(new Event('resize'))
                    // this.currentStepCanSubmit = false
                    // this.currentStepCanCancel = false
                    // console.log('- - - foo - - -')
                },
                immediate: true
            }

            /*
            currentStepCanSubmit: {
                handler (newVal, oldVal) {
                    if (newVal) {
                        this.currentStepCanCancel = true
                    }
                }
            }
            */
        },

        methods: {
            onStepChange (newStep, oldStep) {
                if (this.currentStep === newStep) {
                    return
                }

                this.currentStep = newStep
            },

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

                this.$store.dispatch(types.zcoinpayment.CLEAR_SEND_ZCOIN_RESPONSE)
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
