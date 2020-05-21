<template>
    <section class="settings-page">
        <div class="window-height">
            <div>
                <div class="settings-page-inner">
                    <h1>
                        <span>{{ $t('settings.overview.title') }}</span>

                        <div class="version">
                            Zcoin Client v{{ zcoinClientVersion }}
                        </div>
                    </h1>

                    <section class="interface">
                        <h2>{{ $t('settings.form.interface.title') }}</h2>
                        <div class="form">
                            <language-settings class="language-settings" />

                            <blockchain-explorer-settings class="blockchain-explorer-settings" />
                        </div>
                    </section>

                    <section class="privacy">
                        <h2>{{ $t('settings.form.privacy.title') }}</h2>
                        <div class="form">
                            <connect-via-tor-settings
                                class="connection-settings"
                                @toggle-tor="restartDaemon"
                            />

                            <amount-to-hold-in-zerocoin-settings />
                        </div>
                    </section>

                    <section class="passphrase">
                        <h2>Passphrase</h2>

                        <form class="form">
                            <div class="field">
                                <label>Current Passphrase:</label>
                                <input
                                    v-model="currentPassphrase"
                                    type="password"
                                />
                            </div>

                            <div class="field">
                                <label>New Passphrase:</label>
                                <input
                                    v-model="newPassphrase"
                                    name="newPassphrase"
                                    type="password"
                                    :class="passphraseBoxClass"
                                />
                            </div>

                            <div class="field">
                                <label>Confirm New Passphrase:</label>
                                <input
                                    v-model="confirmNewPassphrase"
                                    name="confirmNewPassphrase"
                                    type="password"
                                    :class="passphraseBoxClass"
                                />
                            </div>
                        </form>

                        <v-popover
                            placement="top-end"
                            popover-class="tooltip popover multi-step-popover"
                            class="change-passphrase-button-popover-container"
                            trigger="manually"
                            :open="openPassphrasePopover"
                            :auto-hide="true"
                            :handle-resize="true"
                            @hide="closePassphrasePopover"
                        >
                            <base-button
                                :disabled="!canChangePassphrase"
                                color="green"
                                @click="changePassphrase"
                            >
                                Change Passphrase
                            </base-button>

                            <template slot="popover">
                                <div class="close-dialog-button">
                                    <a
                                        href="#"
                                        @click.prevent="closePassphrasePopover"
                                    >
                                        X
                                    </a>
                                </div>

                                <div class="content-wrapper">
                                    <div v-if="!changePassphraseError">
                                        Passphrase changed successfully.
                                    </div>

                                    <div v-else>
                                        {{ changePassphraseError }}
                                    </div>
                                </div>
                            </template>
                        </v-popover>
                    </section>
                    <div v-if="apiStatus.data.hasMnemonic" class="mnemonic-setting">
                        <u><a
                                :style="{ cursor: 'pointer'}"
                                @click.prevent="openMnemonicSettings()"                            >
                            <b>Show my mnemonic recovery phrase</b>
                            </a>
                        </u>
                    </div>
                    <ShowMnemonicSettings v-if="showMnemonicSetting" @close-mnemonic="closeMnemonicDialog"/>

                    <section class="backup">
                        <h2>Backup</h2>
                        <input
                            ref="backupDirectory"
                            type="file"
                            hidden
                            webkitdirectory
                            @change="doBackup"
                        />

                        <v-popover
                            :open="popoverStep !== 'initial'"
                            placement="top-end"
                            popover-class="tooltip popover multi-step-popover"
                            class="send-button-popover-container"
                            trigger="manually"
                            :auto-hide="false"
                            :handle-resize="true"
                        >
                            <base-button
                                color="green"
                                @click="openBackupDialog"
                            >
                                Backup Zcoin Data
                            </base-button>

                            <template slot="popover">
                                <div class="close-dialog-button">
                                    <a
                                        @click.prevent="closePopover"
                                        href="#"
                                    >
                                        X
                                    </a>
                                </div>

                                <div class="content-wrapper">
                                    <div v-if="popoverStep === 'wait'">
                                        Please wait...
                                    </div>

                                    <div v-if="popoverStep === 'success'">
                                        Backup succeeded!
                                    </div>

                                    <div v-if="popoverStep === 'error'">
                                        {{ errorMessage }}
                                    </div>
                                </div>
                            </template>
                        </v-popover>
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import BlockchainExplorerSettings from '@/components/SettingsPage/BlockchainExplorerSettings'
import LanguageSettings from '@/components/SettingsPage/LanguageSettings'
import ConnectViaTorSettings from '@/components/SettingsPage/ConnectViaTorSettings'
import AmountToHoldInZerocoinSettings from '@/components/SettingsPage/AmountToHoldInZerocoinSettings'
import ShowMnemonicSettings from '@/components/SettingsPage/ShowMnemonicSettings'

const zcoinClientVersion = require('../../../package.json').version;

export default {
    name: 'SettingsPage',

    components: {
        AmountToHoldInZerocoinSettings,
        ConnectViaTorSettings,
        LanguageSettings,
        BlockchainExplorerSettings,
        ShowMnemonicSettings
    },

    computed: {
        ...mapGetters({
            apiStatus: 'ApiStatus/apiStatus'
        }),

        passphraseBoxClass () {
            return this.confirmNewPassphrase && (this.newPassphrase !== this.confirmNewPassphrase) ?
                'non-matching'
                :
                'matching';
        },

        canChangePassphrase () {
            return this.currentPassphrase && this.newPassphrase && (this.newPassphrase === this.confirmNewPassphrase) && !this.openPassphrasePopover;
        }
    },

    data () {
        return {
            popoverStep: 'initial',
            errorMessage: '',
            changePassphraseError: '',
            currentPassphrase: '',
            newPassphrase: '',
            confirmNewPassphrase: '',
            openPassphrasePopover: false,
            zcoinClientVersion,
            showMnemonicSetting: false
        }
    },

    mounted() {
        this.$on('close-mnemonic', this.closeMnemonicDialog);
    },

    methods: {
        ...mapMutations({
            setWaitingReason: 'App/setWaitingReason'
        }),

        async restartDaemon() {
            this.setWaitingReason("Restarting daemon...");
            await $daemon.stopDaemon();

            $startDaemon();
        },

        async changePassphrase() {
            if (!this.canChangePassphrase) {
                return;
            }

            try {
                await $daemon.setPassphrase(this.currentPassphrase, this.newPassphrase);
            } catch (e) {
                if (e.name === 'IncorrectPassphrase') {
                    this.changePassphraseError = 'Incorrect Passphrase';
                } else if (e.error && e.error.message) {
                    this.changePassphraseError = e.error.message;
                } else {
                    this.changePassphraseError = JSON.stringify(e);
                }
            }

            this.openPassphrasePopover = true;
        },

        async closeMnemonicDialog() {
            console.log('closing');
            this.showMnemonicSetting = false;
        },

        // This also needs to be called on popover auto-close to cleanup data.
        closePassphrasePopover() {
            this.changePassphraseError = '';
            this.openPassphrasePopover = false;
        },

        openBackupDialog() {
            this.$refs.backupDirectory.click();
        },

        openMnemonicSettings() {
            console.log('hasMnemonic:', this.hasMnemonic);
            this.showMnemonicSetting = true;
        },

        async doBackup() {
            let backupDirectory = this.$refs.backupDirectory.files[0].path;
            this.popoverStep = 'wait';

            try {
                await $daemon.backup(backupDirectory);
                this.popoverStep = 'success';
            } catch (e) {
                this.errorMessage = (e.error && e.error.message) ? e.error.message : String(e);
                this.popoverStep = 'error';
            }
        },

        closePopover() {
            this.popoverStep = 'initial';
        }
    },
}
</script>

<style lang="scss" scoped>
    .version {
        font: {
            style: italic;
            weight: normal;
            size: 0.5em;
        }
    }

    .settings-page {
        box-sizing: border-box;
        overflow-y: auto;
    }

    .settings-page-inner {
        padding: emRhythm(5) emRhythm(8) emRhythm(5) emRhythm(4);
    }

    .interface .form {
        .language-settings {
            .control {
                margin-left: emRhythm(-2);
            }
        }
    }

    .passphrase {
        display: table;

        .line {
            display: table-row;

            .left, .right {
                display: table-cell;
                width: max-content;
            }
        }

        .form {
            width: max-content;

            .field {
                display: table-row;

                label, input {
                    display: table-cell;
                }

                label {
                    padding-right: 2em;
                }

                input {
                    background-color: $color--comet-medium;
                    border: none;
                    height: 1.5em;
                    width: 30em;

                    &.non-matching {
                        outline-style: auto;
                        outline-color: red;
                    }
                }
            }
        }
    }

    .close-dialog-button {
        margin-top: 0.5em;
        margin-right: 1em;
        margin-bottom: -2em;
        text-align: right;
        a {
            color: white;
        }
    }

    .mnemonic-setting {
        margin-top: 20px;
        margin-bottom: 20px;
    }
</style>
