<template>
    <section class="settings-page">
        <div class="window-height">
            <div v-scrollable>
                <div class="settings-page-inner">
                    <h1>{{ $t('settings.overview.title') }}</h1>

                    <section class="interface">
                        <h2>{{ $t('settings.form.interface.title') }}</h2>
                        <div class="form">
                            <language-settings />

                            <blockchain-explorer-settings />
                        </div>
                    </section>

                    <section class="privacy">
                        <h2>{{ $t('settings.form.privacy.title') }}</h2>
                        <div class="form">
                            <connect-via-tor-settings />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import BlockchainExplorerSettings from '@/components/SettingsPage/BlockchainExplorerSettings'
import LanguageSettings from '@/components/SettingsPage/LanguageSettings'
import ConnectViaTorSettings from "./SettingsPage/ConnectViaTorSettings";

export default {
    name: 'SettingsPage',
    components: {
        ConnectViaTorSettings,
        LanguageSettings,
        BlockchainExplorerSettings
    }
}
</script>

<style lang="scss" scoped>
    .settings-page {
        //padding: emRhythm(5);
        box-sizing: border-box;
    }

    .settings-page-inner {
        padding: emRhythm(5) emRhythm(4);
    }

    .interface .form {
        display: flex;
        justify-content: space-between;
        padding: 0 emRhythm(2);

        .field {
            flex-grow: 1;

            & + .field {
                margin-left: emRhythm(9);
            }

            /deep/ .control {
                //padding: 0 emRhythm(2);
            }
        }
    }
</style>
