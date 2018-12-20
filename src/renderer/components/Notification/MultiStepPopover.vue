<template>
    <base-popover
        :open="isOpenAndHasComponent"
        :placement="placement"
        :popover-class="popoverClass + ' multi-step-popover'"
        class="timed-popover"
        trigger="manually"
        :can-blur="canBlur"
        :delay="delay"
        :event-bus-name="eventBusName"
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

export default {
    name: 'MultiStepPopover',

    props: {
        isOpen: {
            type: Boolean,
            required: true
        },
        popoverClass: {
            type: String,
            default: ''
        },
        steps: {
            type: Object,
            required: true
        },
        currentStep: {
            type: String,
            required: true
        },
        placement: {
            type: String,
            default: 'top'
        },
        actions: {
            type: Object,
            default: () =>({})
        },
        delay: {
            type: Object,
            default: () => ({})
        },
        componentProps: {
            type: Object,
            default: () => ({})
        },
        canBlur: {
            type: Boolean,
            default: true
        },
        eventBusName: {
            type: String,
            default: ''
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
