<template>
    <section class="settings-page">
        <div class="window-height">
            <div v-scrollable>
                <div class="settings-page-inner">
                    <h1>
                        <base-popover
                            trigger="manual"
                            :open="showRestartDaemon"
                            placement="right-start"
                            popover-class="advice"
                        >
                            <div slot="content">
                                <header>
                                    <h2>{{ $t('settings.flyout-restart-required.title') }}</h2>
                                </header>

                                <p>{{ $t('settings.flyout-restart-required.description') }}</p>

                                <footer>
                                    <base-button
                                        color="green"
                                        @click="restartDaemon"
                                    >
                                        {{ $t('settings.flyout-restart-required.button__restart-now') }}
                                    </base-button>
                                </footer>
                            </div>
                            <template slot="target">
                                <span>{{ $t('settings.overview.title') }}</span>
                            </template>
                        </base-popover>
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
                            <connect-via-tor-settings class="connection-settings" />

                            <amount-to-hold-in-zerocoin-settings />
                        </div>
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
import ConnectViaTorSettings from '@/components/SettingsPage//ConnectViaTorSettings'
import AmountToHoldInZerocoinSettings from '@/components/SettingsPage//AmountToHoldInZerocoinSettings'

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
        }),

        showRestartDaemon () {
            return this.isDaemonRestartRequired && !this.isRestarting
        }
    },

    methods: {
        ...mapActions({
            restartDaemon: types.app.DAEMON_RESTART
        }),
    }
}
</script>

<style lang="scss" scoped>
    .settings-page {
        //padding: emRhythm(5);
        box-sizing: border-box;
    }

    .settings-page-inner {
        padding: emRhythm(5) emRhythm(8) emRhythm(5) emRhythm(4);
    }

    .form {
        display: grid;
        grid-template-columns: 35% auto;
        grid-column-gap: emRhythm(9);

        .field {
            & + .field {
                //margin-left: emRhythm(9);
            }

            /deep/ .control {
                //padding: 0 emRhythm(2);
            }
        }
    }

    .interface .form {
        //display: flex;
        //justify-content: space-between;
        //padding: 0 emRhythm(2) 0 0;

        .language-settings {
            //width: 30%;

            /deep/ .control {
                margin-left: emRhythm(-2);
            }
        }
    }

    .privacy .form {
        //display: flex;
        //justify-content: space-between;
        //padding: 0 emRhythm(2) 0 0;

        .connection-settings {
            //width: 30%;
        }
    }
</style>
