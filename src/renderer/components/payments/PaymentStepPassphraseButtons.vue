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

    mounted () {
        // Here we listen for an event to be emitted from PaymentStepPassphrase. We're doing this because afaict there's
        // no way for us to be able to communicate with each other without using global events. This is really ugly, so
        // TODO: remove this hack, somehow
        this.$eventHub.$on('advance-from-passphrase-step', this.onSubmit)
    },

    beforeDestroy () {
        this.$eventHub.$off('advance-from-passphrase-step')
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
