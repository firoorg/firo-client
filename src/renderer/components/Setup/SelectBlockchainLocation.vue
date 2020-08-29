<template>
    <div class="blockchain-location">
        <div class="header">
            Configuration
        </div>

        <div id="config-options">
            <div class="config-option" id="datadir">
                <label for="datadir-value">
                    Data Directory:
                </label>

                <div class="value">
                    <div id="datadir-value">
                        {{ dataDir }}
                    </div>

                    <div id="datadir-actions">
                        <a href="#" @click="changeDataDir">
                            Change
                        </a>

                        <a href="#" @click="resetDataDir">
                            Reset
                        </a>
                    </div>
                </div>
            </div>

            <div class="config-option" id="network">
                 <label for="network-value">
                     Network:
                 </label>

                <select class="value" id="network-value" v-model="network">
                    <option value="mainnet">Mainnet (default)</option>
                    <option value="test">Testnet</option>
                    <option value="regtest">Regtest</option>
                </select>
            </div>
        </div>

        <div id="setup-button">
            <BaseButton
                color="green"
                @click="continueSetup"
            >
                Next
            </BaseButton>
        </div>
    </div>
</template>

<script>
import fs from 'fs';
import path from 'path';
const remote = require('electron').remote;

import { mapGetters, mapMutations } from 'vuex'

export default {
    name: 'IntroScreenBlockchainLocation',

    data: () => ({
        dataDir: '',
        network: 'mainnet'
    }),

    computed: {
        ...mapGetters({
            zcoindLocation: 'App/zcoindLocation',
            defaultZcoinRootDirectory: 'App/defaultZcoinRootDirectory'
        }),

        // This code is duplicated from src/module/App.js due to potential race conditions.
        walletLocation() {
            if (!this.dataDir) {
                return "dataDir not yet set";
            }

            let dataSubDir;
            switch (this.network) {
            case "mainnet":
                dataSubDir = this.dataDir;
                break;

            case "regtest":
                dataSubDir = path.join(this.dataDir, "regtest");
                break;

            case "test":
                dataSubDir = path.join(this.dataDir, "testnet3");
                break;

            default:
                throw `unknown network: ${this.dataDir}`;
            }

            return path.join(dataSubDir, "wallet.dat");
        }
    },

    mounted() {
        this.dataDir = this.defaultZcoinRootDirectory;
    },

    methods: {
        ...mapMutations({
            setWaitingReason: 'App/setWaitingReason'
        }),

        resetDataDir() {
            this.dataDir = this.defaultZcoinRootDirectory;
        },

        async changeDataDir() {
            const selection = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                title: 'Select Zcoin Data Directory',
                properties: [
                    'openDirectory',
                    'createDirectory',
                    'promptToCreate',
                    'showHiddenFiles'
                ],
                buttonLabel: this.$t('onboarding.set-blockchain-location.button__select-location--primary')
            });
            if (!selection.filePaths.length) return;

            this.dataDir = selection.filePaths[0];
        },

        async continueSetup() {
            if (!path.isAbsolute(this.dataDir)) {
                // These shouldn't be possible from the file selector, but just make sure anyway.
                alert('dataDir must be an absolute path');
                return;
            }

            if (["testnet3", "regtest"].includes(path.basename(this.dataDir))) {
                if (!confirm(`Your wallet will be on the ${this.network} network, and will be located at ` +
                            `"${this.walletLocation}". You probably meant to select the parent directory ` +
                            `(${path.dirname(this.dataDir)}) instead. Are you sure you want to continue?`)) {
                    return;
                }
            }

            // If this.dataDir is the default directory and does not exist, try to create it.
            if (!fs.existsSync(this.dataDir) && this.dataDir === this.defaultZcoinRootDirectory) {
                try {
                    fs.mkdirSync(this.dataDir);
                    this.$log.info(`Created default zcoin dataDir ${this.dataDir}`);
                } catch(e) {
                    this.$log.warn(`Failed to create default zcoin dataDir ${this.dataDir}`);
                    alert("dataDir didn't exist and we weren't able to create it");
                    return;
                }
            }

            try {
                // Throws if permissions are insufficient.
                fs.accessSync(this.dataDir, fs.constants.W_OK | fs.constants.R_OK | fs.constants.X_OK);
            } catch(e) {
                alert("You don't have permission to access the directory you selected. Please try again.")
                return;
            }

            this.$log.info(`Setting zcoinClientNetwork: ${this.network}`);
            this.$store.commit('App/setZcoinClientNetwork', this.network);

            this.$log.info(`Setting blockchain location: ${this.dataDir}`);
            this.$store.commit('App/setBlockchainLocation', this.dataDir);

            // Wait for our updates to propagate to the store so it can be used by $startDaemon. sigh.
            await new Promise(async (resolve) => {
                while (true) {
                    if (this.$store.getters['App/zcoinClientNetwork'] === this.network && this.$store.getters['App/blockchainLocation'] === this.dataDir) {
                        return resolve();
                    }

                    await new Promise(r => setTimeout(r, 100));
                }
            });

            if (fs.existsSync(this.walletLocation)) {
                // The wallet already exists, so we don't need to go through the mnemonics screen.
                await $startDaemon();
                this.$router.push('/main');
            } else {
                // wallet.dat doesn't exist, so we should set it up with a mnemonic.
                this.$router.push('/setup/select-create-or-restore');
            }
        }
    }
}
</script>

<style scoped lang="scss">
.blockchain-location {
    width: max-content;

    .header {
        text-align: center;
        font: {
            weight: bold;
            size: 2.5em;
        }
    }

    #config-options {
        display: table;

        label {
            font-size: 1.2em;
            padding-right: 0.5em;
        }

        #datadir {
            #datadir-value {
                font-weight: bold;
                width: fit-content;
            }

            #datadir-actions {
                font: {
                    style: italic;
                    size: 0.9em;
                }

                a:not(:first-child) {
                    margin-left: 0.5em;
                }
            }
        }

        .config-option {
            display: table-row;

            label, .value {
                display: table-cell;
            }
        }
    }

    #setup-button {
        width: fit-content;
        margin: {
            left: auto;
            right: auto;
            top: 1em;
        }
    }
}
</style>
