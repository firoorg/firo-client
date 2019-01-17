<template>
    <section class="settings-page">
        <div class="window-height">
            <div v-scrollable>
                <div class="settings-page-inner">
                    <h1>{{ $t('settings.overview.title') }}</h1>

                    <section class="interface">
                        <h2>{{ $t('settings.form.interface.title') }}</h2>
                        <div class="form">
                            <div class="field">
                                <label>
                                    {{ $t('settings.form.interface.label__language') }}
                                </label>
                                <span class="description">
                                    {{ $t('settings.form.interface.description__language') }}
                                </span>
                                <div class="control">
                                    <input type="text">
                                </div>
                            </div>

                            <blockchain-explorer-settings />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import BlockchainExplorerSettings from '@/components/SettingsPage/BlockchainExplorerSettings'

export default {
    name: 'SettingsPage',
    components: {
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
