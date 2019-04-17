<template>
    <multi-step-popover
        :steps="getMultiPopoverSteps"
        :current-step="currentStep"
        :is-open="existsAndIsOpen"
        :placement="placement"
        :actions="getTargetActions"
        :component-props="componentProps"
        :popover-class="popoverClass"
        v-on="$listeners"
    >
        <slot
            :name="currentStepTarget"
            :actions="getTargetActions"
            @can-submit="canSubmit"
        />
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
        popoverClass: {
            type: String,
            default: ''
        },
        placement: {
            type: String,
            default: 'top'
        },
        componentProps: {
            type: Object,
            default: () => ({})
        }
    },

    computed: {
        getMultiPopoverSteps () {
            return this.steps
        },

        // todo integrate GuideMixin
        stepKeys () {
            return Object.keys(this.steps)
        },

        // todo integrate GuideMixin
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

        // todo integrate GuideMixin
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
        },

        // todo integrate GuideMixin
        nextStep () {
            if (this.currentIndex < this.stepKeys.length - 1) {
                this.$emit('step-change', this.stepKeys[this.currentIndex + 1], this.currentStep)
            }
        },

        // todo integrate GuideMixin
        prevStep () {
            if (this.currentIndex > 0) {
                this.$emit('step-change', this.stepKeys[this.currentIndex - 1], this.currentStep)
            }
        },

        // todo integrate GuideMixin
        goToStep (stepKey) {
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
