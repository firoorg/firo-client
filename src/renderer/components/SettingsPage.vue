<template>
    <div class="settings-page">
        <Popup v-if="show">
            <div v-if="show === 'message'" class="info-popup">
                <div class="title">{{ messageTitle }}</div>
                <div class="content">{{ message }}</div>
                <div class="buttons">
                    <button class="solid-button recommended" @click="show = null">OK</button>
                </div>
            </div>

            <div v-else-if="show === 'confirm-reset'" class="info-popup">
                <div class="title">Confirm Settings Reset</div>
                <div class="content">Are you sure you want to reset settings? This will not delete any of your data.</div>
                <div class="buttons">
                    <button class="solid-button recommended" @ok="show = null">Cancel</button>
                    <button class="solid-button unrecommended" @ok="redoSetup">Yes, I'm sure</button>
                </div>
            </div>

            <WaitOverlay v-else-if="show === 'wait'" />
            <MnemonicPopup v-else-if="show === 'mnemonic'" @ok="show = null" />
            <ChangePassphrasePopup v-else-if="show === 'change-passphrase'" @cancel="show = null" @ok="show = null" />
        </Popup>

        <div class="header">
            <div class="version">Firo Client v{{ version }}</div>
            <div class="version">firod {{ daemonVersion }}</div>
        </div>

        <div class="options">
            <div class="checkbox-option" @click="useTor = !useTor">
                <label>Connect to other nodes via Tor</label>
                <input type="checkbox" v-model="useTor" />
            </div>
            <div class="checkbox-option" @click="allowBreakingMasternodes = !allowBreakingMasternodes">
                <label>Allow Coin Control to Break Masternodes</label>
                <input type="checkbox" v-model="allowBreakingMasternodes" />
            </div>
            <a @click="openBackupDialog">Backup Wallet</a>
            <a @click="show = 'change-passphrase'">Change Passphrase</a>
            <a @click="show = 'mnemonic'">Show Recovery Phrase</a>
            <a @click="show = 'confirm-reset'">Reset Settings</a>
        </div>
    </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import {remote} from 'electron';
import version from "../../version";
import Popup from 'renderer/components/shared/Popup';
import MnemonicPopup from "renderer/components/SettingsPage/MnemonicPopup";
import ChangePassphrasePopup from "renderer/components/SettingsPage/ChangePassphrasePopup";
import WaitOverlay from "renderer/components/shared/WaitOverlay";

export default {
    name: 'SettingsPage',

    components: {
        Popup,
        WaitOverlay,
        MnemonicPopup,
        ChangePassphrasePopup
    },

    computed: {
        ...mapGetters({
            apiStatus: 'ApiStatus/apiStatus',
            hasMnemonic: 'ApiStatus/hasMnemonic',
            daemonVersion: 'ApiStatus/version',
            _allowBreakingMasternodes: 'App/allowBreakingMasternodes'
        }),

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
            version,
            useTor: $store.getters['Settings/isConnectedViaTor'],
            show: null, // 'change-passphrase' | 'mnemonic'
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

            this.show = 'wait';

            try {
                await $daemon.backup(backupDirectory);
                this.messageTitle = 'Success!';
                this.message = 'Your wallet.dat has been backed up.';
            } catch (e) {
                this.messageTitle = 'Error';
                this.message = e && e.message ? e.message : `${e}`;
            }
            this.show = 'message';
        },

        async redoSetup() {
            await this.$store.dispatch('App/setIsInitialized', false);
            await $quitApp();
        }
    },
}
</script>

<style lang="scss" scoped>
@import "src/renderer/styles/info-popup";

.settings-page {
    padding: {
        top: var(--padding-main);
        bottom: var(--padding-main);
        left: calc(var(--padding-main) - 3px);
        right: calc(var(--padding-main) - 3px);
    }

    .header {
        margin: {
            left: 3px;
            right: 3px;
            bottom: var(--padding-main);
        }

        color: var(--color-primary);
        font: {
            size: 24px;
            weight: bold;
        }

        display: flex;

        .version:not(:first-child) {
            margin-left: var(--padding-main);
        }

        .version:not(:last-child) {
            padding-right: var(--padding-main);
            border-right: {
                style: solid;
                width: 1px;
                color: var(--color-text-subtle-border);
            }
        }
    }

    .options {
        a, .checkbox-option {
            cursor: pointer;
            font-weight: bold;

            display: block;

            padding: {
                left: 3px;
                right: 3px;
                top: var(--padding-main);
                bottom: var(--padding-main);
            }

            border-top: {
                style: solid;
                width: 1px;
                color: var(--color-text-subtle-border);
            }

            &:last-child {
                border-bottom: {
                    style: solid;
                    width: 1px;
                    color: var(--color-text-subtle-border);
                }
            }

            &:hover {
                border-radius: 5px;
                background-color: var(--color-primary-button-hover);

                padding: {
                    top: calc(var(--padding-main) + 1px);
                    bottom: calc(var(--padding-main) + 1px);
                }

                border-top-style: none;
                border-bottom-style: none;
                & + * {
                    border-top-style: none;
                }
            }
        }

        .checkbox-option {
            display: flex;
            justify-content: space-between;

            label {
                padding: {
                    top: 3px;
                    bottom: 3px;
                }
            }
        }
    }
}
</style>
