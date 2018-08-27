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
                <span>Cancel</span>
            </base-button>
        </template>

        <multi-step-popover-buttons :steps="stepComponents"
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
                    Unlock and send
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

    // import types from '~/types'

    import MultiStepPopoverButtons from '@/components/Notification/MultiStepPopoverButtons'
    import SendStepConfirm from '@/components/SendZcoinPage/SendStepConfirm'
    import SendAddToQueueButton from '@/components/SendZcoinPage/SendAddToQueueButton'
    import SendStepStartButton from '@/components/SendZcoinPage/SendStepStartButton'
    import SendStepConfirmButtons from '@/components/SendZcoinPage/SendStepConfirmButtons'
    import SendStepSelectFee from '@/components/SendZcoinPage/SendStepSelectFee'
    import PaymentStepPassphrase from '@/components/payments/PaymentStepPassphrase'
    import PaymentStepPassphraseButtons from '@/components/payments/PaymentStepPassphraseButtons'
    import SpendZerocoinStepStatus from '@/components/SpendZerocoinPage/SpendZerocoinStepStatus'

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
            SpendZerocoinStepStatus
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
                        component: SpendZerocoinStepStatus,
                        isOpen () {
                            return !this.isLoading
                        },
                        placement () {
                            return 'top'
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
                isError: 'ZcoinPayment/sendZcoinResponseIsError',
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

                if (this.isError) {
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