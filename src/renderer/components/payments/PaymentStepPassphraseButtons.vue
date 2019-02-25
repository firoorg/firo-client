<template>
    <base-button
        type="submit"
        :color="color"
        :disabled="!canSubmit"
        @click="onSubmit"
    >
        <slot />
    </base-button>
</template>

<script>
export default {
    name: 'PaymentStepPassphraseButtons',

    props: {
        actions: {
            type: Object,
            required: true
        },
        canSubmit: {
            type: Boolean,
            default: false
        },
        onFormSubmit: {
            type: Function,
            required: true
        },
        color: {
            type: String,
            default: ''
        }
    },

    methods: {
        onSubmit() {
            if (this.onFormSubmit() !== false) {
                this.actions.next()
            }
        }
    }
}
</script>

<style scoped>

</style>
