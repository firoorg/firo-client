<template>
    <section class="settings-page">
        <div class="window-height">
            <div v-scrollable>
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

                    <section class="backup">
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
                            <base-button @click="openBackupDialog">
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
import { mapGetters, mapActions } from 'vuex'
import types from '~/types'

import BlockchainExplorerSettings from '@/components/SettingsPage/BlockchainExplorerSettings'
import LanguageSettings from '@/components/SettingsPage/LanguageSettings'
import ConnectViaTorSettings from '@/components/SettingsPage/ConnectViaTorSettings'
import AmountToHoldInZerocoinSettings from '@/components/SettingsPage/AmountToHoldInZerocoinSettings'

const zcoinClientVersion = require('../../../package.json').version;

export default {
    name: 'SettingsPage',
    components: {
        AmountToHoldInZerocoinSettings,
        ConnectViaTorSettings,
        LanguageSettings,
        BlockchainExplorerSettings
    },

    computed: {
        ...mapGetters({
            isDaemonRestartRequired: 'Settings/isDaemonRestartRequired',
            isRestarting: 'App/isRestarting'
        })
    },

    data () {
        return {
            popoverStep: 'initial',
            errorMessage: '',
            zcoinClientVersion
        }
    },

    methods: {
        ...mapActions({
            restartDaemon: types.app.DAEMON_RESTART
        }),

        openBackupDialog() {
            this.$refs.backupDirectory.click();
        },

        async doBackup() {
            let backupDirectory = this.$refs.backupDirectory.files[0].path;
            this.popoverStep = 'wait';

            try {
                await this.$daemon.backup(backupDirectory);
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
    }

    .settings-page-inner {
        padding: emRhythm(5) emRhythm(8) emRhythm(5) emRhythm(4);
    }

    .form {
        display: grid;
        grid-template-columns: 35% auto;
        grid-column-gap: emRhythm(9);
    }

    .interface .form {
        .language-settings {
            .control {
                margin-left: emRhythm(-2);
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
</style>
