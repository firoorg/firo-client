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

        <div class="pure-buttons">
            <button @click="openBackupDialog">
                Backup Wallet
            </button>

            <button @click="redoSetup">
                Redo Setup
            </button>
        </div>

        <div class="tor-settings">
            <div class="guidance">
                Enabling Tor will increase your anonymity by hiding the IP address you connect to the Firo network with.
            </div>

            <div class="tor-checkbox-line">
                <input type="checkbox" v-model="useTor" />
                <label>
                    Connect to Other Nodes via Tor
                </label>
            </div>
        </div>

        <hr class="hr2" />

        <div class="detail-buttons">
            <button :class="{active: showDetail === 'passphrase'}" @click="showPassphrase">
                Change Passphrase
            </button>

            <button v-if="hasMnemonic" :class="{active: showDetail === 'mnemonic'}" @click="() => showMnemonicPassphrasePopup = true">
                Show Mnemonic Recovery Phrase
            </button>
        </div>

        <div class="detail">
            <div v-if="showDetail === 'passphrase'" class="change-passphrase">
                <div class="passphrase-inputs">
                    <label>Current Passphrase:</label>
                    <input type="password" v-model="currentPassphrase" />

                    <label>New Passphrase:</label>
                    <input type="password" v-model="newPassphrase" :class="{matching: passphrasesMatch}" />

                    <label>Confirm Passphrase:</label>
                    <input type="password" v-model="confirmNewPassphrase" :class="{matching: passphrasesMatch}" />
                </div>

                <div class="buttons">
                    <button :disabled="!canChangePassphrase" :class="{active: canChangePassphrase}" @click="changePassphrase">
                        Change Passphrase
                    </button>
                </div>
            </div>

            <SmallMnemonic v-if="showDetail === 'mnemonic'" :words="mnemonicWords" />
        </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {remote} from 'electron';
import Popup from './Popup';
import ErrorStep from "./SendPage/ErrorStep";
import SmallMnemonic from "./SettingsPage/SmallMnemonic";
import {IncorrectPassphrase} from "daemon/firod";
import SendStepPassphrase from "renderer/components/SendPage/PassphraseStep";
import SuccessMessage from "renderer/components/SuccessMessage";

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
            hasMnemonic: 'ApiStatus/hasMnemonic'
        }),

        passphrasesMatch () {
            return !this.confirmNewPassphrase || this.newPassphrase === this.confirmNewPassphrase;
        },

        canChangePassphrase () {
            return this.currentPassphrase && this.newPassphrase && (this.newPassphrase === this.confirmNewPassphrase);
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

            this.$store.commit('App/setIsInitialized', false);
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
    grid-template-columns: 2fr 4fr 1fr;
    grid-template-areas: "header         header"
                         "hr1            hr1"
                         "pure-buttons   tor-settings"
                         "hr2            hr2"
                         "detail-buttons detail";

    .pure-buttons, .detail-buttons {
        padding-right: $size-main-margin;
    }

    .tor-settings, .detail {
        padding-left: $size-main-margin;
    }

    button {
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

    .pure-buttons {
        grid-area: pure-buttons;
        @include buttons-vertical-container();
    }

    .tor-settings {
        grid-area: tor-settings;

        .guidance {
            @include guidance();
            margin-bottom: $size-between-field-space-medium;
        }
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
