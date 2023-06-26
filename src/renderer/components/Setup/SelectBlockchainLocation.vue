<template>
    <div class="blockchain-location info-popup">
        <div class="title">
            Select Network and Blockchain Location
        </div>

        <div class="content">
            <div class="row">
                <label>Data Directory</label>
                <div class="datadir-field">
                    <div id="datadir-value">{{ dataDir }}</div>

                    <div class="datadir-actions">
                        <a @click="changeDataDir">Change</a>
                        <a id="reset-data-dir" @click="resetDataDir">Reset</a>
                    </div>
                </div>
            </div>

            <div class="row network">
                <label>Network</label>
                <select class="selector" id="datadir-selector" v-model="network">
                    <option value="mainnet">Mainnet (default)</option>
                    <option value="test">Testnet</option>
                    <option value="regtest-ql">Regtest</option>
                </select>
            </div>
        </div>

        <div class="buttons">
            <button class="solid-button recommended" @click="continueSetup">Next</button>
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
            firodLocation: 'App/firodLocation',
            defaultFiroRootDirectory: 'App/defaultFiroRootDirectory'
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

            case "regtest-ql":
                dataSubDir = path.join(this.dataDir, "regtest-ql");
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
        this.dataDir = this.defaultFiroRootDirectory;

        // This is required for testing due to Spectron not being very good at handline file dialogs.
        document.addEventListener('set-data-dir', (event) => {
            this.dataDir = event.dataDir;
        });
    },

    methods: {
        ...mapMutations({
            setWaitingReason: 'App/setWaitingReason'
        }),

        resetDataDir() {
            this.dataDir = this.defaultFiroRootDirectory;
        },

        async changeDataDir() {
            const selection = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
                title: 'Select Firo Data Directory',
                properties: [
                    'openDirectory',
                    'createDirectory',
                    'promptToCreate',
                    'showHiddenFiles'
                ],
                buttonLabel: 'Select Data Directory'
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

            if (["testnet3", "regtest", "regtest-ql"].includes(path.basename(this.dataDir))) {
                if (!confirm(`Your wallet will be on the ${this.network} network, and will be located at ` +
                            `"${this.walletLocation}". You probably meant to select the parent directory ` +
                            `(${path.dirname(this.dataDir)}) instead. Are you sure you want to continue?`)) {
                    return;
                }
            }

            // If this.dataDir is the default directory and does not exist, try to create it.
            if (!fs.existsSync(this.dataDir) && this.dataDir === this.defaultFiroRootDirectory) {
                try {
                    fs.mkdirSync(this.dataDir);
                    console.info(`Created default firo dataDir ${this.dataDir}`);
                } catch(e) {
                    console.warn(`Failed to create default firo dataDir ${this.dataDir}`);
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

            console.info(`Setting firoClientNetwork: ${this.network}`);
            await this.$store.dispatch('App/setFiroClientNetwork', this.network);

            console.info(`Setting blockchain location: ${this.dataDir}`);
            await this.$store.dispatch('App/setBlockchainLocation', this.dataDir);

            // Wait for our updates to propagate to the store so it can be used by $startDaemon. sigh.
            await new Promise(async (resolve) => {
                while (true) {
                    if (this.$store.getters['App/firoClientNetwork'] === this.network && this.$store.getters['App/blockchainLocation'] === this.dataDir) {
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
    .content {
        min-width: 0;
        width: fit-content;
        text-align: left;

        .row {
            display: flex;

            &.network {
                margin-top: var(--padding-base);

                label {
                    padding: {
                        top: 8px;
                        bottom: 8px;
                    }
                }
            }

            label {
                width: 150px;
            }

            .datadir-actions {
                font-size: 0.8em;

                #reset-data-dir {
                    margin-left: 6px;
                }
            }
        }
    }
}
</style>
