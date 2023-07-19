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
                    <button class="solid-button recommended" @click="show = null">Cancel</button>
                    <button class="solid-button unrecommended" @click="redoSetup">Yes, I'm sure</button>
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
            <div class="select-option">
                <label>Appearance</label>
                <select class="selector" v-model="colorTheme" >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>

            <div class="checkbox-option" @click="enableElysium = !enableElysium">
                <label>Enable Experimental Elysium Features (Requires Rescan)</label>
                <input id="enable-elysium-checkbox" type="checkbox" :checked="enableElysium" />
            </div>

            <div class="checkbox-option" @click="useTor = !useTor">
                <label>Connect to other nodes via Tor</label>
                <input type="checkbox" :checked="useTor" />
            </div>

            <div class="checkbox-option" @click="allowBreakingMasternodes = !allowBreakingMasternodes">
                <label>Allow Coin Control to Break Masternodes</label>
                <input type="checkbox" :checked="allowBreakingMasternodes" />
            </div>

            <a @click="openBackupDialog">Backup Wallet</a>

            <a id="change-passphrase-button" @click="show = 'change-passphrase'">Change Passphrase</a>

            <a @click="show = 'mnemonic'">Show Recovery Phrase</a>

            <a @click="show = 'confirm-reset'">Reset Settings</a>
        </div>
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex'
import { ipcRenderer, remote } from 'electron';
import version from "../../version";
import Popup from 'renderer/components/shared/Popup';
import MnemonicPopup from "renderer/components/SettingsPage/MnemonicPopup";
import ChangePassphrasePopup from "renderer/components/SettingsPage/ChangePassphrasePopup";
import WaitOverlay from "renderer/components/shared/WaitOverlay";
import InputFrame from "renderer/components/shared/InputFrame";

export default {
    name: 'SettingsPage',

    components: {
        InputFrame,
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
            _colorTheme: 'App/colorTheme',
            _enableElysium: 'App/enableElysium',
            _allowBreakingMasternodes: 'App/allowBreakingMasternodes'
        }),

        allowBreakingMasternodes: {
            get() {
                return this._allowBreakingMasternodes;
            },

            set(value) {
                this.setAllowBreakingMasternodes(value);
            }
        },

        enableElysium: {
            get() {
                return this._enableElysium;
            },

            set(value) {
                this.setEnableElysium(value);
                this.$nextTick(async () => {
                    $setWaitingReason("Restarting daemon...");
                    await $daemon.stopDaemon();
                    await $startDaemon();
                });
            }
        },

        colorTheme: {
            get() {
                return this._colorTheme;
            },

            set(value) {
                this.setColorTheme(value);
            }
        }
    },

    data () {
        return {
            version,
            useTor: $store.getters['Settings/isConnectedViaTor'],
            show: null, // 'change-passphrase' | 'mnemonic'
            successMessage: null,
            errorMessage: null,
            messageTitle: '',
            message: ''
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

        ...mapActions({
            setColorTheme: 'App/setColorTheme',
            setEnableElysium: 'App/setEnableElysium'
        }),

        async openBackupDialog() {
            const r = await ipcRenderer.invoke('select-directory', {
                title: "Select Backup File Directory",
                buttonLabel: "Select Backup File Directory",
                properties: [
                    'createDirectory',
                    'openDirectory'
                ]
            });
            if (r?.length !== 1) return;
            const backupDirectory = r[0];

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
        top: var(--padding-base);
        bottom: var(--padding-base);
        left: calc(var(--padding-base) - 3px);
        right: calc(var(--padding-base) - 3px);
    }

    .header {
        margin: {
            left: 3px;
            right: 3px;
            bottom: var(--padding-base);
        }

        color: var(--color-primary);
        font: {
            size: 24px;
            weight: bold;
        }

        display: flex;

        .version:not(:first-child) {
            margin-left: var(--padding-base);
        }

        .version:not(:last-child) {
            padding-right: var(--padding-base);
            border-right: {
                style: solid;
                width: 1px;
                color: var(--color-text-subtle-border);
            }
        }
    }

    .options {
        a, .checkbox-option, .select-option {
            cursor: pointer;
            font-weight: bold;

            display: block;

            padding: {
                left: 3px;
                right: 3px;
                top: var(--padding-base);
                bottom: var(--padding-base);
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
                    top: calc(var(--padding-base) + 1px);
                    bottom: calc(var(--padding-base) + 1px);
                }

                border-top-style: none;
                border-bottom-style: none;
                & + * {
                    border-top-style: none;
                }
            }
        }

        .checkbox-option, .select-option {
            display: flex;
            justify-content: space-between;
        }

        .checkbox-option {
            label {
                padding: {
                    top: 3px;
                    bottom: 3px;
                }
            }
        }

        .select-option {
            label {
                padding: {
                    top: 8px;
                    bottom: 8px;
                }
            }
        }
    }
}
</style>
