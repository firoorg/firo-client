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
            currentStep: ''
        }
    },

    computed: {
        stepKeys () {
            return Object.keys(this.steps)
        },

        currentIndex () {
            console.log(this.stepKeys, this.currentStep)
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

            return this.steps[this.currentStep].props.bind(this)()
        },

        currentPopoverClass () {
            return [this.submitButtonColor, `${'step'}-${this.currentStep}`].join(' ')
        },

        getActions () {
            return {
                prev: this.prevStep,
                next: this.nextStep,
                goTo: this.goToStep
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
            console.log('go to step', stepKey)
            if (!this.steps[stepKey]) {
                return false
            }

            this.$emit('step-change', stepKey, this.currentStep)
            return true
        }
    }
}
