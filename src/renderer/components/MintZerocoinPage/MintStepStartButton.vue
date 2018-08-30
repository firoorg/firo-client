<template>
    <base-button :color="color"
                 @click.prevent="next"
                 :disabled="!canSubmit">
        Mint Now
    </base-button>
</template>

<script>
    export default {
        name: 'MintStepStartButton',

        props: {
            canSubmit: {
                type: Boolean,
                default: false
            },
            color: {
                type: String
            }
        },

        methods: {
            next () {
                this.$emit('next')
            }
        }
    }
</script>

<style scoped>

</style>
