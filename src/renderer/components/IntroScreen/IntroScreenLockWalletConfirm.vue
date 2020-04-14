<template>
    <form @submit.prevent="onSubmitForm">
        <h1>{{ $t('onboarding.confirm-passphrase.title') }}</h1>
        <p v-html="$t('onboarding.confirm-passphrase.description')" />

        <div class="form">
            <div class="control confirm">
                <input
                    v-focus
                    type="password"
                    :placeholder="$t('onboarding.confirm-passphrase.placeholder__confirm-passphrase')"
                    v-model="confirmPassphrase"
                >
            </div>
        </div>

        <footer>
            <base-button
                is-outline
                type="button"
                @click="onCancel"
            >
                {{ $t('onboarding.confirm-passphrase.button__create-other-passphrase--secondary') }}
            </base-button>
            <base-button
                type="submit"
                :disabled="!isEqual"
                color="green"
            >
                {{ $t('onboarding.create-passphrase.button__set-passphrase--primary') }}
            </base-button>
        </footer>
    </form>
</template>

<script>
export default {
    name: 'IntroScreenLockWalletConfirm',

    data: () => ({
        confirmPassphrase: ""
    }),

    props: {
        onCancel: {
            type: Function,
            required: true
        },
        onConfirm: {
            type: Function,
            required: true
        },
        targetPassphrase: {
            type: String,
            required: true
        }
    },

    computed: {
        isEqual() {
            return this.targetPassphrase === this.confirmPassphrase;
        }
    },

    methods: {
        onSubmitForm () {
            if (!this.isEqual) {
                return
            }

            this.onConfirm()
        }
    }
}
</script>

<style scoped>

</style>
