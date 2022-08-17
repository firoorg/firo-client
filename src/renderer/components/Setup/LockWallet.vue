<template>
    <div class="lock-wallet info-popup">
        <div class="title">
            Select a Passphrase for Your Wallet
        </div>

        <div class="content">
            <div class="guidance">
                Your wallet will be encrypted with your chosen passphrase. It is <span class="emphasis">IMPOSSIBLE</span> to
                recover your funds if you forget your passphrase and seed phrase.
            </div>

            <div class="passphrase-input">
                <InputFrame label="Passphrase">
                    <input
                        type="password"
                        id="passphrase"
                        v-model="passphrase"
                        @focus="() => passphraseInputIsFocused = true"
                        @blur="() => passphraseInputIsFocused = false"
                    />
                </InputFrame>
                <InputFrame label="Confirm Passphrase">
                    <input
                        :class="hasMismatchedPassphrase ? 'mismatched' : 'matched'"
                        v-model="confirmPassphrase"
                        type="password"
                        id="confirm-passphrase"
                    />
                </InputFrame>
            </div>

            <div v-if="isExistingWallet" class="existing-wallet-confirmation">
                You are locking an existing wallet, which already has private keys in it. It will be
                <span class="emphasis">IMPOSSIBLE</span> to access this wallet again unless you have the passphrase
                given above.

                <div class="checkbox-field">
                    <input type="checkbox" v-model="hasConfirmedExistingWallet" />
                    <label>
                        I understand I will not be able to access my <span class="emphasis">existing wallet</span>
                        without this passphrase.
                    </label>
                </div>
            </div>
        </div>

        <div class="buttons">
            <button v-if="isExistingWallet" class="solid-button unrecommended" @click="quit" tabindex="-1">
                Quit
            </button>

            <button v-else id="back-button" class="solid-button unrecommended" @click="goBack" tabindex="-1">
                Back
            </button>

            <button id="ok-button" class="solid-button recommended" @click="lockWallet" tabindex="-1" :disabled="!canProceed">
                OK
            </button>
        </div>
    </div>
</template>

<script>
import zxcvbn from 'zxcvbn';
import {Firod} from "daemon/firod";
import {mapGetters} from "vuex";
import InputFrame from "renderer/components/shared/InputFrame";

function apiStatus(daemon, eventData) {
    if (eventData?.data?.newLogMessages?.length) {
        $store.commit('App/appendLogMessages', eventData.data.newLogMessages);
    }
}

export default {
    name: "LockWallet",
    components: {InputFrame},
    data() {
        return {
            passphrase: '',
            confirmPassphrase: '',
            hasConfirmedExistingWallet: false,
            passphraseStrength: 0,
            passphraseInputIsFocused: false
        }
    },

    // route params:
    //
    // // Information about the mnemonic we should initialize the wallet with. It MAY be empty is isExistingWallet and
    // // resolve are set.
    // mnemonic?: {
    //   mnemonic: string;
    //   mnemonicPassphrase: string | null;
    //   isNewMnemonic: boolean;
    // }
    //
    // // Are we going to lock a preexisting wallet.dat? If this is set, onStart MUST be set, mnemonic MUST NOT be, and
    // // window.$daemon MUST be set (and already started).
    // isExistingWallet?: boolean

    watch: {
        passphrase: {
            immediate: true,
            handler() {
                this.passphraseStrength = zxcvbn(this.passphrase).score;
            }
        }
    },

    computed: {
        ...mapGetters({
            firoClientNetwork: 'App/firoClientNetwork',
            firodLocation: 'App/firodLocation',
            blockchainLocation: 'App/blockchainLocation'
        }),

        // isExistingWallet is passed through a route query. If it is true, $daemon MUST already be initialised.
        isExistingWallet() {
            return !!this.$route.query.isExistingWallet;
        },

        mnemonic() {
            return this.$route.query.mnemonic;
        },

        // A callback to be called when we're finished setting everything up. This is passed so as to allow $startDaemon
        // in router/main.js to resolve.
        onStart() {
            return this.$route.query.onStart;
        },

        hasMismatchedPassphrase() {
            return this.passphrase !== this.confirmPassphrase && (this.confirmPassphrase || !this.passphraseInputIsFocused);
        },

        canProceed() {
            return this.passphrase && this.passphrase === this.confirmPassphrase && (!this.isExistingWallet || this.hasConfirmedExistingWallet);
        }
    },

    methods: {
        async quit() {
            await $quitApp();
        },

        goBack() {
            this.$router.back();
        },

        async lockWallet() {
            if ((this.isExistingWallet && (this.mnemonic || !$daemon)) ||
                (!this.mnemonic && !this.isExistingWallet)) {
                await $quitApp("Firo Client failed an internal sanity check. Report this to the Firo team.");
            }

            if (this.isExistingWallet) {
                $setWaitingReason("Preparing to lock your wallet...");
            } else if (this.mnemonic.isNewMnemonic) {
                $setWaitingReason("Initializing firod with our mnemonic...");
            } else {
                $setWaitingReason("Setting our mnemonic and rescanning the blockchain. This may take a while...");
            }

            let initialDaemon;
            if (!this.isExistingWallet) {
                try {
                    initialDaemon = new Firod(this.firoClientNetwork, this.firodLocation, this.blockchainLocation, [], {apiStatus});
                    await initialDaemon.start(this.mnemonic);
                } catch (e) {
                    await $quitApp(`Failed to start firod with mnemonic: ${e}`);
                }
            } else {
                initialDaemon = $daemon;
            }

            $setWaitingReason("Waiting for firod API to be ready...");
            await initialDaemon.awaitApiIsReady();

            $setWaitingReason("Locking your wallet...");
            try {
                // This call will shutdown firod and return after firod stops listening.
                await initialDaemon.setPassphrase(null, this.passphrase);
            } catch(e) {
                await $quitApp("Something unexpected went wrong with locking the wallet, so we can't proceed.");
            }

            await $startDaemon();

            if (!this.isExistingWallet) {
                $setWaitingReason("Sanity checking recovery seed phrase...");
                const mnemonicSanityCheck = (await $daemon.showMnemonics(this.passphrase)).join(' ');
                if (mnemonicSanityCheck !== this.mnemonic.mnemonic) {
                    // This should never happen.
                    await $quitApp("Recovery seed phrase sanity check failed. This is a bug. Seek help from the Firo team; do not try to use the client again.");
                }
                this.$log.info("Recovery seed phrase sanity check passed.");
            }

            $setWaitingReason(undefined);

            this.$log.info("Marking app as initialized...");
            await this.$store.dispatch('App/setIsInitialized', true);

            await this.$router.push('/main');
        }
    }
}
</script>

<style scoped lang="scss">
.content {
    width: 500px;

    .emphasis {
        color: var(--color-primary);
    }

    .guidance {
        margin: auto;
        width: 400px;
        text-align: center;
        margin-bottom: var(--padding-base);
        font-weight: bold;
    }

    .existing-wallet-confirmation {
        margin-top: var(--padding-base);
        text-align: left;

        .checkbox-field {
            margin-top: var(--padding-base);
        }
    }
}
</style>
