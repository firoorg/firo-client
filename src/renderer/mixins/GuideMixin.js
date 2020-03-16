import { cloneDeep } from 'lodash'
import { isThursday } from 'date-fns'

export default {
    props: {
        boundariesElement: {
            type: HTMLElement,
            required: false
        }
    },

    data () {
        return {
            steps: {},
            currentStep: '',
            walletRecoveryType: 'qt',
            isWalletLoadComplete: false,
            cachedMnemonic: '',
            isMnemonicVerified: false
        }
    },

    computed: {
        stepKeys () {
            return Object.keys(this.steps)
        },

        currentIndex () {
            this.$log.debug(this.stepKeys, this.currentStep)
            return this.stepKeys.indexOf(this.currentStep)
        },

        currentPlacement () {
            const current = this.steps[this.currentStep]

            return current && current.placement ? current.placement.bind(this)() : 'top-end'
        },

        currentStepIsOpen () {
            // todo isOpen vs GuideStepMixin:enabled
            if (!this.hasCurrentKey('isOpen')) {
                return
            }

            return this.steps[this.currentStep].isOpen.bind(this)()
        },

        currentComponentProps () {
            if (!this.hasCurrentKey('props')) {
                return
            }

            return cloneDeep(this.steps[this.currentStep].props.bind(this)())
        },

        currentPopoverClass () {
            return [this.submitButtonColor, `${'step'}-${this.currentStep}`].join(' ')
        },

        getActions () {
            return {
                prev: this.prevStep,
                next: this.nextStep,
                goTo: this.goToStep,
                currentStep: this.getCurrentStep,
                setWalletRecoveryType: this.setWalletRecoveryType,
                getWalletRecoveryType: this.getWalletRecoveryType,
                setWalletIndexComplete: this.setWalletIndexComplete,
                getWalletIndexComplete: this.getWalletIndexComplete,
                getCachedMnemonic: this.getCachedMnemonic,
                setCachedMnemonic: this.setCachedMnemonic,
                setIsMnemonicVerified: this.setIsMnemonicVerified,
                getIsMnemonicVerified: this.getIsMnemonicVerified
            }
        }
    },

    watch: {
        currentStep: {
            handler (newVal, oldVal) {
                window.dispatchEvent(new Event('resize'))
                if (!newVal) {
                    this.$emit('steps-close')
                } else {
                    this.$emit('steps-open')
                }
            },
            immediate: false // todo valdate behaviour
        }
    },

    methods: {
        hasCurrentKey (key) {
            if (!this.steps[this.currentStep]) {
                return false
            }

            if (!this.steps[this.currentStep][key]) {
                return false
            }

            return true
        },

        getCurrentStep() {
            return this.currentStep;
        },

        setWalletRecoveryType(ty) {
            this.walletRecoveryType = ty;
        },

        getWalletRecoveryType() {
            return this.walletRecoveryType;
        },

        getWalletIndexComplete() {
            return this.isWalletLoadComplete;
        },
        setWalletIndexComplete(v) {
            this.isWalletLoadComplete = v;
        },
        
        getCachedMnemonic() {
            return this.cachedMnemonic;
        },

        getIsMnemonicVerified() {
            return this.isMnemonicVerified;
        },

        setIsMnemonicVerified() {
            this.isMnemonicVerified = true;
        },

        setCachedMnemonic(cachedMnemonic_) {
            this.cachedMnemonic = cachedMnemonic_;
        },

        onStepChange (newStep, oldStep) {
            if (this.currentStep === newStep) {
                return
            }
            this.currentStep = newStep
        },

        nextStep () {
            if (this.currentIndex === -1) {
                return false
            }

            if (this.currentIndex >= this.stepKeys.length - 1) {
                return false
            }
            console.log('NextStep:', this.stepKeys[this.currentIndex + 1]);
            this.$emit('step-change', this.stepKeys[this.currentIndex + 1], this.currentStep)
            return true
        },

        prevStep () {
            if (this.currentIndex <= 0) {
                return false
            }

            this.$emit('step-change', this.stepKeys[this.currentIndex - 1], this.currentStep)
            return true
        },

        goToStep (stepKey) {
            this.$log.debug('go to step', stepKey)
            if (!this.steps[stepKey]) {
                return false
            }
            console.log('currentStep:', this.currentStep);

            this.$emit('step-change', stepKey, this.currentStep)
            return true
        }
    }
}
