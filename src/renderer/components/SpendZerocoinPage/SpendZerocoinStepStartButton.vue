<template>
    <base-button :color="color"
                 :is-dark="true"
                 @click.prevent="next"
                 :disabled="!canSubmit">
        {{ $t('spend.detail-private-send.button__private-send--primary') }}
    </base-button>
</template>

<script>
    export default {
        name: 'SpendZerocoinStepStartButton',

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
