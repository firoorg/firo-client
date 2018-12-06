<template>
    <base-popover
        :open="isOpenAndHasComponent"
        :placement="placement"
        :popover-class="popoverClass + ' multi-step-popover'"
        class="timed-popover"
        :boundaries-element="boundariesElement"
        trigger="manually"
        :can-blur="canBlur"
        :delay="delay"
        v-on="$listeners"
    >
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <component
                :is="currentStepComponent"
                v-bind="componentProps"
                :actions="actions"
            />
        </template>
    </base-popover>
</template>

<script>
import isObject from 'lodash/isObject'

// import TestA from '@/components/Notification/TestA'
// import TestB from '@/components/Notification/TestB'

export default {
    name: 'MultiStepPopover',
    /*
        components: {
            TestA,
            TestB
        },
        */
    props: {
        isOpen: {
            type: Boolean,
            required: true
        },
        boundariesElement: {
            required: false
        },
        popoverClass: {
            type: String
        },
        steps: {
            type: Object,
            required: true
        },
        currentStep: {
            type: String
        },
        placement: {
            type: String,
            default: 'top'
        },
        actions: {
            type: Object,
            required: false
        },
        delay: {
            type: Object,
            required: false
        },
        componentProps: {
            type: Object
        },
        canBlur: {
            type: Boolean,
            default: true
        }
    },

    computed: {
        isOpenAndHasComponent () {
            return this.isOpen && !!this.currentStepComponent
        },

        currentStepComponent () {
            return this.stepComponents[this.currentStep] ? this.stepComponents[this.currentStep] : null
        },

        stepComponents () {
            let components = {}
            for (let key of Object.keys(this.steps)) {
                const step = this.steps[key]

                console.log(step)
                if (isObject(step) && step.component) {
                    components[key] = step.component
                } else {
                    components[key] = step
                }
            }

            return components
        }
    }
}
</script>

<style scoped>

</style>