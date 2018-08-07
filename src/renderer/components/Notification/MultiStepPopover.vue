<template>
    <base-popover
            :open="isOpen"
            placement="top"
            :popover-class="popoverClass + ' multi-step-popover'"
            class="timed-popover"
            :boundaries-element="boundariesElement"
            trigger="manually"
    >
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <component :is="currentStepComponent"></component>
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
            }
        },

        computed: {
            currentStepComponent () {
                return this.steps[this.currentStep] ? this.steps[this.currentStep] : null
            }
        }
    }
</script>

<style scoped>

</style>