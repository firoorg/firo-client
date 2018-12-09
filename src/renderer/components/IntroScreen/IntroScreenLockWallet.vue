<template>
    <component
        v-if="!showConfirm"
        :is="currentComponent"
        :passphrase.sync="passphrase"
        :go-to-confirm="goToConfirm"
    />
    <div v-else-if="!isConfirmed">
        <h1>{{ $t('onboarding.create-passphrase.title') }}</h1>
        <p v-html="$t('onboarding.confirm-passphrase.description')" />

        <div class="form">
            <div class="control confirm">
                <input
                    v-model="confirm"
                    type="text"
                    :placeholder="$t('onboarding.confirm-passphrase.placeholder__confirm-passphrase')"
                >
            </div>
        </div>

        <footer>
            <base-button
                is-outline
                @click="() => showConfirm = false"
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
    <div v-else>
        <h1>{{ $t('onboarding.create-passphrase.title') }}</h1>
        <h2 v-html="$t('onboarding.final-confirmation.description')" />

        <footer>
            <base-button
                color="red"
                is-outline
                @click="actions.prev"
            >
                {{ $t('onboarding.final-confirmation.button__create-other-passphrase--secondary') }}
            </base-button>
            <base-button
                color="green"
                @click="actions.next"
            >
                {{ $t('onboarding.final-confirmation.button__confirm-passphrase--primary') }}
            </base-button>
        </footer>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GuideStepMixin from '@/mixins/GuideStepMixin'
import IntroScreenLockWalletCreate from './IntroScreenLockWalletCreate'

export default {
    name: 'IntroScreenLockWallet',
    components: {IntroScreenLockWalletCreate},
    mixins: [
        GuideStepMixin
    ],
    data () {
        return {
            passphrase: '',
            isValidPassphrase: false,
            confirm: '',
            showConfirm: false,
            isConfirmed: false
        }
    },
    computed: {
        ...mapGetters({
            isLocked: 'App/isLocked'
        }),
        isEqual () {
            return this.passphrase === this.confirm
        },
        currentComponent () {
            const base = 'IntroScreenLockWallet'

            let name = 'Create'

            return `${base}${name}`
        }
    },
    methods: {
        goToConfirm () {
            this.showConfirm = true
            this.confirm = null
        },
        onConfirm () {
            this.isConfirmed = true
        },
        isEnabled () {
            return !this.isLocked
        }
    }
}
</script>

<style lang="scss" scoped>
    .form {
        margin-top: emRhythm(7);
    }
    .form .control input {
        // @include green-input();
    }

    .form .control.passphrase {
        display: flex;
        padding-right: 0;

    }

    .form .control.passphrase input[type="text"] {
        flex-grow: 1;
        width: 1%;
    }
</style>
