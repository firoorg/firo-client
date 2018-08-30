import PaymentStepPassphrase from '@/components/payments/PaymentStepPassphrase'
import StepResponseStatus from '@/components/payments/StepResponseStatus'

export default {

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
                    component: this.getConfirmStep(),
                    isOpen () {
                        console.log('is open ->', this, this.currentStepCanSubmit)
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
                                this.onAutoClose()
                            }
                        }
                    }
                }

            },
            currentStepCanSubmit: false,
            currentStepCanCancel: false,
            isConfirmed: false,
            onCancelActionName: '',
            responseNamespace: ''
        }
    },

    computed: {
        // mixin override
        canStart () {
            return this.formIsValid
        },

        canSubmit () {
            return this.canStart && this.currentStepCanSubmit
        },

        submitButtonColor () {
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

        onClose () {
            this.isConfirmed = false
            this.currentStep = null
            this.currentStepCanSubmit = false
            this.currentStepCanCancel = false
        },

        onAutoClose () {
            this.onClose()
            this.$emit('steps-done')
        },

        onCancel () {
            this.onAutoClose()

            if (this.onCancelActionName) {
                this.$store.dispatch(this.onCancelActionName)
            }
        }
    }
}
