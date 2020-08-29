<template>
    <div class="lock-wallet">
        <div class="title">
            Select a Passphrase for Your Wallet
        </div>

        <div class="content">
            <div class="passphrase-input">
                <div class="guidance">
                    Your wallet will be encrypted with your chosen passphrase. It is <span class="emphasis">IMPOSSIBLE</span> to
                    recover your funds if you forget your passphrase.
                </div>

                <div class="input-groups">
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
                </div>
            </div>

            <div v-if="isExistingWallet" class="existing-wallet-confirmation-input">
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

            <div class="buttons">
                <BaseButton v-if="isExistingWallet" @click="quit" class="button" color="comet" tabindex="-1">
                    Quit
                </BaseButton>

                <BaseButton v-else @click="goBack" class="button" color="comet" tabindex="-1">
                    Back
                </BaseButton>

                <BaseButton @click="lockWallet" class="button" color="green" tabindex="-1" :disabled="!canProceed">
                    Submit
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script>
import zxcvbn from 'zxcvbn';
import {Zcoind} from "#/daemon/zcoind";
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
    //
    // // A callback to call when zcoind has been fully started, set to $daemon, and has run its initializers. This MUST
    // // be set iff isExistingWallet is set. If this is not set, we will redirect to /main instead.
    // onStart: () => void

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
            zcoinClientNetwork: 'App/zcoinClientNetwork',
            zcoindLocation: 'App/zcoindLocation',
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
            if ((this.isExistingWallet && (this.mnemonic || typeof this.onStart !== 'function' || !$daemon)) ||
                (this.mnemonic && this.onStart) ||
                (!this.mnemonic && !this.isExistingWallet)) {
                await $quitApp("Zcoin Client failed an internal sanity check. Report this to the Zcoin team.");
            }

            if (this.isExistingWallet) {
                $setWaitingReason("Preparing to lock your wallet...");
            } else if (this.mnemonic.isNewMnemonic) {
                $setWaitingReason("Initializing zcoind with our mnemonic...");
            } else {
                $setWaitingReason("Setting our mnemonic and rescanning the blockchain. This may take a while...");
            }

            let initialDaemon;
            if (!this.isExistingWallet) {
                try {
                    initialDaemon = new Zcoind(this.zcoinClientNetwork, this.zcoindLocation, this.blockchainLocation, [], {});
                    await initialDaemon.start(this.mnemonic);
                } catch (e) {
                    await $quitApp(`Failed to start zcoind with mnemonic: ${e}`);
                }
            } else {
                initialDaemon = $daemon;
            }

            $setWaitingReason("Waiting for zcoind API to be ready...");
            await initialDaemon.awaitApiIsReady();

            $setWaitingReason("Locking your wallet...");
            try {
                // This call will shutdown zcoind and return after zcoind stops listening.
                await initialDaemon.setPassphrase(null, this.passphrase);
            } catch(e) {
                await $quitApp("Something unexpected went wrong with locking the wallet, so we can't proceed.");
            }

            await $startDaemon();

            if (this.mnemonic) {
                $setWaitingReason("Sanity checking mnemonic...");
                const mnemonicSanityCheck = await $daemon.showMnemonics(this.passphrase);
                if (mnemonicSanityCheck !== this.mnemonic.mnemonic) {
                    // This should never happen.
                    await $quitApp("Mnemonic sanity check failed. This is a bug. Seek help from the Zcoin team; do not try to use the client again.");
                }
                this.$log.info("Mnemonic sanity check passed.");
            }

            $setWaitingReason(undefined);

            this.$log.info("Marking app as initialized...");
            this.$store.commit('App/setIsInitialized', true);

            if (this.isExistingWallet) {
                this.onStart();
            } else {
                this.$router.push('/main');
            }
        }
    }
}
</script>

<style scoped lang="scss">
.lock-wallet {
    width: fit-content;
}

.title {
    width: fit-content;
    margin: auto;
    font: {
        size: 2em;
        weight: bold;
    }
}

.guidance {
    font-style: italic;

    .emphasis {
        font-weight: bold;
        color: $color--red-dark;
    }
}

.content {
    width: fit-content;
    margin: auto;

    .passphrase-input {
        margin-top: 1em;

        .input-groups {
            .input-group {
                margin-top: 1em;

                label {
                    display: block;

                    font: {
                        size: 1.2em;
                        weight: bold;
                    }
                }

                input {
                    border-radius: 10px;
                    border-style: none;
                    height: 2em;
                    width: 25em;

                    &:focus {
                        outline: none;
                    }
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
        }
    }

    .existing-wallet-confirmation-input {
        margin-top: 1em;

        .confirm-existing-wallet {
            margin-top: 0.2em;
            font-weight: bold;

            input {
                margin-right: 0.2em;
            }
        }
    }

    .buttons {
        width: fit-content;
        margin: {
            top: 2em;
            left: auto;
            right: auto;
        }
    }
}
</style>
