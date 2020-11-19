
<template>
    <div class="lock-wallet">
        <div class="title">
            Select a Passphrase for Your Wallet
        </div>

        <div class="content">
            <div class="guidance">
                Your wallet will be encrypted with your chosen passphrase. It is <span class="emphasis">IMPOSSIBLE</span> to
                recover your funds if you forget your passphrase.
            </div>

            <div class="input-group">
                <label for="passphrase">
                    Enter Your Passphrase
                </label>

                <div class="passphrase-input-and-meter">
                    <input
                        type="password"
                        id="passphrase"
                        v-model="passphrase"
                        @focus="() => passphraseInputIsFocused = true"
                        @blur="() => passphraseInputIsFocused = false"
                    />
                    <div id="passphrase-strength-meter" :class="`strength-${passphraseStrength}`" />
                </div>
            </div>

            <div class="input-group">
                <label for="confirm-passphrase">
                    Confirm Your Passphrase
                </label>

                <input
                    :class="hasMismatchedPassphrase ? 'mismatched' : 'matched'"
                    v-model="confirmPassphrase"
                    type="password"
                    id="confirm-passphrase"
                />
            </div>

            <div v-if="isExistingWallet" class="existing-wallet-confirmation">
                <div class="guidance">
                    You are locking an existing wallet, which already has private keys in it. It will be
                    <span class="emphasis">IMPOSSIBLE</span> to access this wallet again unless you have the passphrase
                    given above.
                </div>

                <div class="confirm-existing-wallet">
                    <input type="checkbox" v-model="hasConfirmedExistingWallet" />
                    I understand that I will not be able to access my <span class="emphasis">existing wallet</span> without
                    this passphrase.
                </div>
            </div>
        </div>

        <div class="buttons">
            <button v-if="isExistingWallet" @click="quit" tabindex="-1">
                Quit
            </button>

            <button v-else @click="goBack" tabindex="-1">
                Back
            </button>

            <button @click="lockWallet" tabindex="-1" :disabled="!canProceed">
                Submit
            </button>
        </div>
    </div>
</template>

<script>
import zxcvbn from 'zxcvbn';
import {Firod} from "daemon/firod";
import {mapGetters} from "vuex";

export default {
    name: "LockWallet",

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
                    initialDaemon = new Firod(this.firoClientNetwork, this.firodLocation, this.blockchainLocation, [], {});
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
                $setWaitingReason("Sanity checking mnemonic...");
                const mnemonicSanityCheck = (await $daemon.showMnemonics(this.passphrase)).join(' ');
                if (mnemonicSanityCheck !== this.mnemonic.mnemonic) {
                    console.log(this.mnemonic.mnemonic);
                    console.log(mnemonicSanityCheck);
                    // This should never happen.
                    await $quitApp("Mnemonic sanity check failed. This is a bug. Seek help from the Firo team; do not try to use the client again.");
                }
                this.$log.info("Mnemonic sanity check passed.");
            }

            $setWaitingReason(undefined);

            this.$log.info("Marking app as initialized...");
            this.$store.commit('App/setIsInitialized', true);

            await this.$router.push('/main');
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";
@import "src/renderer/styles/colors";
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/popup";
@import "src/renderer/styles/inputs";

@include popup();

* {
    user-select: none !important;
}

.lock-wallet {
    width: $size-large-field-width * 2 !important;
}

.guidance {
    font-style: italic;
    text-align: center;

    .emphasis {
        font-weight: bold;
        color: $color-error;
    }
}

.content {
    width: fit-content;
    margin: auto;

    .input-group {
        margin-top: $size-between-field-space-big;

        label {
            display: block;

            @include label();
            @include large();
        }

        input {
            @include wide-input-field();
        }

        .passphrase-input-and-meter {
            width: fit-content;

            .passphrase-strength-meter {
                height: 0.4em;
                border-radius: 10px;

                &.strength-0 {
                    width: 3%;
                    background-color: red;
                }

                &.strength-1 {
                    width: 25%;
                    background-color: red;
                }

                &.strength-2 {
                    width: 50%;
                    background-color: orange;
                }

                &.strength-3 {
                    width: 75%;
                    background-color: yellowgreen;
                }

                &.strength-4 {
                    width: 100%;
                    background-color: green;
                }
            }
        }

        #confirm-passphrase {
            &.mismatched {
                box-shadow: 0 0 0 3px red;
            }
        }
    }

    .existing-wallet-confirmation {
        margin-top: $size-small-space;

        .confirm-existing-wallet {
            margin-top: $size-tiny-space;
            @include label();

            input {
                margin-right: $size-tiny-space;
            }
        }
    }
}

.buttons {
    margin-top: $size-small-space;
}
</style>
