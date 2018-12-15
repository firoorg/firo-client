<template>
    <div>
        <h1>{{ $t('onboarding.confirm-passphrase.title') }}</h1>
        <p v-html="$t('onboarding.confirm-passphrase.description')" />

        <div class="form">
            <div class="control confirm">
                <input
                    type="text"
                    :placeholder="$t('onboarding.confirm-passphrase.placeholder__confirm-passphrase')"
                    @input="onChange"
                >
            </div>
        </div>

        <footer>
            <base-button
                is-outline
                @click="onCancel"
            >
                {{ $t('onboarding.confirm-passphrase.button__create-other-passphrase--secondary') }}
            </base-button>
            <base-button
                :disabled="!isEqual"
                color="green"
                @click="onConfirm"
            >
                {{ $t('onboarding.create-passphrase.button__set-passphrase--primary') }}
            </base-button>
        </footer>
    </div>
</template>

<script>
export default {
    name: 'IntroScreenLockWalletConfirm',
    props: {
        onCancel: {
            type: Function,
            required: true
        },
        onConfirm: {
            type: Function,
            required: true
        },
        isEqual: {
            type: Boolean,
            required: true
        }
    },

    methods: {
        onChange (event) {
            const { value } = event.target
            this.$emit('update:confirm', value)
        }
    }
}
</script>

<style scoped>

</style>
