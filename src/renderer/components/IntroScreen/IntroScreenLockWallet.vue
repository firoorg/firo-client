<template>
    <div>
        <h1 v-html="$t('onboarding.create-passphrase.title')" />

        <template v-if="!showConfirm">
            <p v-html="$t('onboarding.create-passphrase.description')" />

            <div class="form">
                <div class="control passphrase">
                    <input
                        v-model="passphrase"
                        type="text"
                        placeholder="Enter Passphrase"
                    >
                    <div>
                        <base-button
                            v-if="!passphrase"
                            color="comet"
                        >
                            {{ $t('onboarding.create-passphrase.button__generate-passphrase--primary') }}
                        </base-button>
                    </div>
                </div>
            </div>

            <footer>
                <base-button
                    color="green"
                    :disabled="!passphrase"
                    @click="goToConfirm"
                >
                    {{ $t('onboarding.confirm-passphrase.button__confirm-passphrase--primary') }}
                </base-button>
            </footer>
        </template>

        <template v-else-if="!isConfirmed">
            <p v-html="$('onboarding.confirm-passphrase.description')" />

            <div class="form">
                <div class="control confirm">
                    <input
                        v-model="confirm"
                        type="text"
                        placeholder="Confirm Passphrase"
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
        </template>
        <template v-else>
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
        </template>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GuideStepMixin from '@/mixins/GuideStepMixin'

export default {
    name: 'IntroScreenLockWallet',
    mixins: [
        GuideStepMixin
    ],
    data () {
        return {
            passphrase: null,
            confirm: null,
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
