<template>
    <div class="settings-page">
        <Popup v-if="errorMessage">
            <ErrorStep :error="errorMessage" @ok="() => errorMessage = null" />
        </Popup>

        <Popup v-if="successMessage">
            <SuccessMessage :message="successMessage" @ok="() => successMessage = null" />
        </Popup>

        <Popup v-if="showMnemonicPassphrasePopup">
            <SendStepPassphrase
                v-model="mnemonicPassphrase"
                :error="mnemonicPassphraseError"
                @cancel="clearMnemonicPassphrasePopup"
                @confirm="tryShowMnemonicRecoveryPhrase"
            />
        </Popup>

        <h1 class="header">
            firo client v2.0.0
        </h1>

        <hr class="hr1" />

        <button class="backup-wallet" @click="openBackupDialog">
            Backup Wallet
        </button>

        <button class="redo-setup" @click="redoSetup">
            Redo Setup
        </button>

        <div class="use-tor">
            <input type="checkbox" v-model="useTor" />
            <label>
                Connect to Other Nodes via Tor
            </label>
        </div>

        <div class="allow-breaking-masternodes">
            <input type="checkbox" v-model="allowBreakingMasternodes" />
            <label>
                Allow Coin Control to Break Masternodes
            </label>
        </div>

        <hr class="hr2" />

        <div class="detail-buttons">
            <button :class="{active: showDetail === 'passphrase'}" @click="showPassphrase">
                Change Passphrase
            </button>

            <button v-if="hasMnemonic" :class="{active: showDetail === 'mnemonic'}" @click="() => showMnemonicPassphrasePopup = true">
                Show Mnemonic Recovery Phrase
            </button>

            <div v-else>
            </div>
        </div>

        <div class="detail">
            <div v-if="showDetail === 'passphrase'" class="change-passphrase">
                <div class="passphrase-inputs">
                    <label>Current Passphrase:</label>
                    <input id="current-passphrase-input" type="password" v-model="currentPassphrase" />

                    <label>New Passphrase:</label>
                    <input id="new-passphrase-input" type="password" v-model="newPassphrase" :class="{matching: passphrasesMatch}" />

                    <label>Confirm Passphrase:</label>
                    <input id="confirm-new-passphrase-input" type="password" v-model="confirmNewPassphrase" :class="{matching: passphrasesMatch}" />
                </div>

                <div class="buttons">
                    <button id="change-passphrase-button" :disabled="!canChangePassphrase" :class="{active: canChangePassphrase}" @click="changePassphrase">
                        Change Passphrase
                    </button>
                </div>
            </div>

            <SmallMnemonic v-if="showDetail === 'mnemonic'" :words="mnemonicWords" />
        </div>
    </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import {remote} from 'electron';
import Popup from 'renderer/components/shared/Popup';
import ErrorStep from "./SendPage/ErrorStep";
import SmallMnemonic from "./SettingsPage/SmallMnemonic";
import {IncorrectPassphrase} from "daemon/firod";
import SendStepPassphrase from "renderer/components/SendPage/PassphraseStep";
import SuccessMessage from "renderer/components/SettingsPage/SuccessMessage";

export default {
    name: 'SettingsPage',

    components: {
        SendStepPassphrase,
        Popup,
        ErrorStep,
        SmallMnemonic,
        SuccessMessage
    },

    computed: {
        ...mapGetters({
            apiStatus: 'ApiStatus/apiStatus',
            hasMnemonic: 'ApiStatus/hasMnemonic',
            _allowBreakingMasternodes: 'App/allowBreakingMasternodes'
        }),

        passphrasesMatch () {
            return !this.confirmNewPassphrase || this.newPassphrase === this.confirmNewPassphrase;
        },

        canChangePassphrase () {
            return this.currentPassphrase && this.newPassphrase && (this.newPassphrase === this.confirmNewPassphrase);
        },

        allowBreakingMasternodes: {
            get() {
                return this._allowBreakingMasternodes;
            },

            set(value) {
                this.setAllowBreakingMasternodes(value);
            }
        }
    },

    data () {
        return {
            useTor: $store.getters['Settings/isConnectedViaTor'],
            showDetail: 'passphrase', // 'passphrase' | 'mnemonic'
            currentPassphrase: '',
            newPassphrase: '',
            confirmNewPassphrase: '',
            changePassphraseError: null,
            showMnemonicPassphrasePopup: false,
            mnemonicPassphrase: '',
            mnemonicPassphraseError: null,
            mnemonicWords: [],
            successMessage: null,
            errorMessage: null
        };
    },

    watch: {
        async useTor() {
            $setWaitingReason("Restarting daemon...");
            await $daemon.updateSettings({torsetup: this.useTor ? '1' : '0'});
            await $daemon.stopDaemon();
            await $startDaemon();
        }
    },

    methods: {
        ...mapMutations({
            setAllowBreakingMasternodes: 'App/setAllowBreakingMasternodes'
        }),

        showPassphrase() {
            this.showDetail = 'passphrase';
            this.mnemonicWords = [];
        },

        clearMnemonicPassphrasePopup() {
            this.mnemonicPassphrase = '';
            this.mnemonicPassphraseError = null;
            this.showMnemonicPassphrasePopup = false;
        },

        async tryShowMnemonicRecoveryPhrase() {
            if (this.showDetail === 'mnemonic') return;

            try {
                this.mnemonicWords = await $daemon.showMnemonics(this.mnemonicPassphrase);
                this.clearMnemonicPassphrasePopup();
                this.showDetail = 'mnemonic';
            } catch (e) {
                this.mnemonicPassphrase = '';
                if (e instanceof IncorrectPassphrase) {
                    this.mnemonicPassphraseError = 'Incorrect Passphrase';
                } else {
                    this.mnemonicPassphraseError = `${e}`;
                }
            }
        },

        async changePassphrase() {
            if (!this.canChangePassphrase) return;

            try {
                await $daemon.setPassphrase(this.currentPassphrase, this.newPassphrase);
                this.newPassphrase = '';
                this.confirmNewPassphrase = '';
                this.successMessage = 'Passphrase Changed!'
            } catch (e) {
                if (e instanceof IncorrectPassphrase) {
                    this.errorMessage = 'Incorrect Passphrase';
                } else {
                    this.errorMessage = `${e}`;
                }
            }

            this.currentPassphrase = '';
        },

        async openBackupDialog() {
            const selected = await remote.dialog.showOpenDialog({
                title: "Select Backup File Directory",
                buttonLabel: "Select Backup File Directory",
                properties: [
                    'createDirectory',
                    'openDirectory'
                ]
            });

            const backupDirectory = selected.filePaths[0];
            if (!backupDirectory) return;

            this.popoverStep = 'wait';

            try {
                await $daemon.backup(backupDirectory);
                this.successMessage = 'Your wallet.dat has been backed up.';
            } catch (e) {
                this.errorMessage = (e.error && e.error.message) ? e.error.message : String(e);
            }
        },

        async redoSetup() {
            if (!confirm("Are you sure you want to reset the configuration?")) {
                return;
            }

            await this.$store.dispatch('App/setIsInitialized', false);
            await $quitApp();
        }
    },
}
</script>

<style lang="scss" scoped>
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/colors";
@import "src/renderer/styles/typography";
@import "src/renderer/styles/inputs";

.settings-page {
    padding: $size-main-margin;
    display: grid;
    align-items: center;
    grid-template-columns: 2fr 4fr 1fr;
    grid-template-areas: "header         header"
                         "hr1            hr1"
                         "backup-wallet  use-tor"
                         "redo-setup     allow-breaking-masternodes"
                         "hr2            hr2"
                         "detail-buttons detail";

    .backup-wallet, .redo-setup, .detail-buttons {
        padding-right: $size-main-margin;
    }

    .use-tor, .allow-breaking-masternodes, .detail {
        padding-left: $size-main-margin;
    }

    button {
        @include button();
        height: 30px;
        width: $size-medium-button-width;
    }

    label {
        @include label();
    }

    hr {
        width: 100%;
        margin: {
            top: $size-medium-space;
            bottom: $size-medium-space
        }

        &.hr1 {
            grid-area: hr1;
        }

        &.hr2 {
            grid-area: hr2;
        }
    }

    .header {
        grid-area: header;
    }

    .backup-wallet {grid-area: backup-wallet;}
    .redo-setup {grid-area: redo-setup;}
    .allow-breaking-masternodes {grid-area: allow-breaking-masternodes;}
    .use-tor {grid-area: use-tor;}

    .backup-wallet, .use-tor {
        margin-bottom: $size-between-field-space-medium
    }

    .detail-buttons {
        grid-area: detail-buttons;
        @include buttons-vertical-container();
    }

    .detail {
        grid-area: detail;

        .change-passphrase {
            .passphrase-inputs {
                display: grid;
                grid-row-gap: $size-between-field-space-medium;
                grid-template-columns: 1fr 2fr;
            }

            input[type="password"] {
                @include input-field();
            }

            .change-passphrase-error {
                text-align: center;
                margin-top: $size-between-field-space-medium;
                @include error();
            }

            .buttons {
                margin-top: $size-between-field-space-medium;
                @include buttons-vertical-container;

                button {
                    width: fit-content;
                    margin: auto;
                }
            }
        }
    }
}
</style>
