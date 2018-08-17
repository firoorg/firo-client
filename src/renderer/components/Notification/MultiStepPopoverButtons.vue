<template>
    <multi-step-popover :steps="getMultiPopoverSteps"
                        :current-step="currentStep"
                        :is-open="existsAndIsOpen"
                        :placement="placement"
                        :boundaries-element="boundariesElement"
                        :actions="getTargetActions"
                        v-on="$listeners"
                        :component-props="componentProps"
                        :popover-class="popoverClass">
        <slot :name="currentStepTarget" :actions="getTargetActions" @can-submit="canSubmit" />
    </multi-step-popover>
</template>

<script>
    import MultiStepPopover from '@/components/Notification/MultiStepPopover'

    export default {
        name: 'MultiStepPopoverButtons',
        components: {
            MultiStepPopover
        },

        props: {
            steps: {
                type: Object,
                required: true
            },
            currentStep: {
                type: String,
                default: ''
            },

            // popover
            isOpen: {
                type: Boolean,
                default: true
            },
            boundariesElement: {
                required: false
            },
            popoverClass: {
                type: String
            },
            placement: {
                type: String
            },
            componentProps: {
                type: Object
            }
        },

        computed: {
            getMultiPopoverSteps () {
                return this.steps
            },

            stepKeys () {
                return Object.keys(this.steps)
            },

            currentIndex () {
                return this.stepKeys.indexOf(this.currentStep)
            },

            existsAndIsOpen () {
                return this.currentIndex >= 0 && this.isOpen
            },

            currentStepTarget () {
                const currentStepTargetSlotName = `step-${this.currentStep}`

                return this.$slots[currentStepTargetSlotName] || this.$scopedSlots[currentStepTargetSlotName] ? currentStepTargetSlotName : 'default'
            },

            getTargetActions () {
                return {
                    prev: this.prevStep,
                    next: this.nextStep,
                    goTo: this.goToStep
                }
            }
        },

        methods: {
            canSubmit () {
                console.log('can submit!!')
            },

            nextStep () {
                if (this.currentIndex < this.stepKeys.length - 1) {
                    this.$emit('step-change', this.stepKeys[this.currentIndex + 1], this.currentStep)
                }
            },

            prevStep () {
                if (this.currentIndex > 0) {
                    this.$emit('step-change', this.stepKeys[this.currentIndex - 1], this.currentStep)
                }
            },

            goToStep (stepKey) {
                console.log('go to step', stepKey)
                if (!this.steps[stepKey]) {
                    return
                }

                this.$emit('step-change', stepKey, this.currentStep)
            }
        }
    }
</script>

<style scoped>

</style>