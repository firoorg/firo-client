<template>
    <base-button :color="color"
                 :can-submit="canSubmit"
                 @click="actions.next">
        Unlock and send
    </base-button>
</template>

<script>
    export default {
        name: 'SendStepPassphraseButtons',

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
        },

        mounted () {
            this.$parent.$emit('can-submit', true)
        }
    }
</script>

<style scoped>

</style>