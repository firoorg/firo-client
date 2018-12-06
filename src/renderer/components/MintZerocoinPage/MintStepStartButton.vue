<template>
    <base-button
        :color="color"
        :disabled="!canSubmit"
        @click.prevent="next"
    >
        {{ $t('mint.detail-create-mint.button__mint-start--primary') }}
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
