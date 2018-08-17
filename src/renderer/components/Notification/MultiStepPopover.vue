<template>
    <base-popover
            :open="isOpenAndHasComponent"
            :placement="placement"
            :popover-class="popoverClass + ' multi-step-popover'"
            class="timed-popover"
            :boundaries-element="boundariesElement"
            trigger="manually"
            v-on="$listeners">
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <component v-bind="componentProps"
                       :is="currentStepComponent"
                       :actions="actions"></component>
        </template>
    </base-popover>
</template>

<script>
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
            componentProps: {
                type: Object
            }
        },

        computed: {
            isOpenAndHasComponent () {
                return this.isOpen && !!this.currentStepComponent
            },

            currentStepComponent () {
                return this.steps[this.currentStep] ? this.steps[this.currentStep] : null
            }
        }
    }
</script>

<style scoped>

</style>