import { getName, getTypeName } from '~/utils'
import types from '~/types'

import PaymentStepPassphrase from '@/components/payments/PaymentStepPassphrase'
import StepResponseStatus from '@/components/payments/StepResponseStatus'

export default {

    props: {
        formIsValid: {
            type: Boolean,
            required: true
        },
        onFormSubmit: {
            type: Function,
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
                        return true
                    },
                    placement () {
                        return this.currentStepCanSubmit ? 'top-end' : 'top'
                    },
                    props () {
                        return {
                            ...this.getConfirmStepProps(),
                            isTimerDone: this.isConfirmed
                        }
                    }
                },
                ...this.getAdditionalSteps(),
                passphrase: {
                    component: PaymentStepPassphrase,
                    isOpen () {
                        return true
                    },
                    props () {
                        return {
                            ...this.getPassphraseStepProps
                        }
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
                            },
                            ...this.getDoneStepProps
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
        responseIsValid () {
            return this.$store.getters[this.responseGetterName + 'ResponseIsValid']
        },
        responseIsError () {
            return this.$store.getters[this.responseGetterName + 'ResponseIsError']
        },
        responseError () {
            return this.$store.getters[this.responseGetterName+ 'ResponseError']
        },

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
        },

        getPassphraseStepProps () {
            return {}
        },

        getDoneStepProps () {
            return {}
        },

        responseGetterName () {
            if (!this.responseNamespace) {
                return ''
            }

            const [mod, namespace] = this.responseNamespace.split('/')

            const { name } = getName(namespace.toLowerCase())

            return `${mod}/${name}`
        },

        responseActionName () {
            if (!this.responseNamespace) {
                return ''
            }

            const [mod, namespace] = this.responseNamespace.toLowerCase().split('/')

            const { NAME } = getName(namespace)
            const actionName = getTypeName(`CLEAR ${NAME} RESPONSE`)

            if (mod && actionName && types[mod] && types[mod][actionName]) {
                return types[mod][actionName]
            }

            return ''
        },
    },

    methods: {
        onStepCanSubmit (newVal) {
            this.currentStepCanSubmit = newVal
        },

        onStepCanCancel (newVal) {
            this.currentStepCanCancel = newVal
        },

        onConfirm (newVal) {
            this.isConfirmed = newVal
        },

        onClose () {
            this.isConfirmed = false
            this.currentStep = ''
            this.currentStepCanSubmit = false
            this.currentStepCanCancel = false

            this.clearResponse()
        },

        onAutoClose () {
            this.onClose()
            this.$emit('steps-done')
        },

        clearResponse () {
            if (this.responseActionName) {
                this.$log.debug('clear response dispatched')
                this.$store.dispatch(this.responseActionName)
            }
        },

        onCancel () {
            this.onAutoClose()
            this.clearResponse()

            if (this.onCancelActionName) {
                this.$store.dispatch(this.onCancelActionName)
            }
        },

        goToPassphraseStep () {
            if (!this.goToStep) {
                return
            }

            //this.isConfirmed = false
            this.clearResponse()

            this.currentStepCanSubmit = false
            this.currentStepCanCancel = true
            this.isConfirmed = true
            this.currentStep = 'passphrase'
        },

        getAdditionalSteps () {
            return {}
        }
    }
}
