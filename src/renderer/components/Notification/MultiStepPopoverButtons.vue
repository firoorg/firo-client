<template>
    <multi-step-popover :steps="getMultiPopoverSteps"
                        :current-step="currentStep"
                        :is-open="isOpen">
        <slot :name="currentStepTarget" :actions="getTargetActions"/>
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
            boundariesElement: {
                required: false
            },
            popoverClass: {
                type: String
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

            isOpen () {
                return this.currentIndex >= 0
            },

            currentStepTarget () {
                const currentStepTargetSlotName = `step-${this.currentStep}`

                return this.$slots[currentStepTargetSlotName] || this.$scopedSlots[currentStepTargetSlotName] ? currentStepTargetSlotName : 'default'
            },

            getTargetActions () {
                return {
                    prev: this.prevStep,
                    next: this.nextStep
                }
            }
        },

        methods: {
            nextStep () {
                if (this.currentIndex < this.stepKeys.length - 1) {
                    this.$emit('step-change', this.stepKeys[this.currentIndex + 1], this.currentStep)
                }
            },

            prevStep () {
                if (this.currentIndex > 0) {
                    this.$emit('step-change', this.stepKeys[this.currentIndex - 1], this.currentStep)
                }
            }
        }
    }
</script>

<style scoped>

</style>