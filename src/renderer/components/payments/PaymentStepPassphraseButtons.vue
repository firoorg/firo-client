<template>
    <base-button :color="color"
                 :disabled="!canSubmit"
                 @click="actions.next">
        Unlock and send
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
            color: {
                type: String
            }
        }
    }
</script>

<style scoped>

</style>