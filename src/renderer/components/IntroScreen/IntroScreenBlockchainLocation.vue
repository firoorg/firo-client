<template>
    <div>
        <h1>
            Configuration
        </h1>

        <div id="config-options">
            <div class="config-option" id="datadir">
                <label for="datadir-value">
                    Data Directory:
                </label>

                <div class="value">
                    <span id="datadir-value">
                        {{ dataDir }}
                    </span>

                    <a id="change-datadir" href="#" @click="changeDataDir">
                        Change
                    </a>
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
import GuideStepMixin from '@/mixins/GuideStepMixin'

import zcoind from "#/daemon/init";

export default {
    name: 'IntroScreenBlockchainLocation',

    mixins: [
        GuideStepMixin
    ],

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

        async changeDataDir() {
            this.dataDir = remote.dialog.showOpenDialog({
                title: 'Select Zcoin Data Directory',
                properties: [
                    'openDirectory',
                    'createDirectory',
                    'promptToCreate',
                    'showHiddenFiles'
                ],
                buttonLabel: this.$t('onboarding.set-blockchain-location.button__select-location--primary')
            })[0];
        },

        async continueSetup() {
            if (!path.isAbsolute(this.dataDir)) {
                // These shouldn't be possible from the file selector, but just make sure anyway.
                alert('dataDir must be an absolute path');
                return;
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

            // The wallet already exists, so we don't need to go through the mnemonics screen.
            if (fs.existsSync(this.walletLocation)) {
                this.setWaitingReason("Starting zcoind...");
                try {
                    window.$daemon = await zcoind(this.$store, this.network, this.zcoindLocation, this.dataDir);
                } catch(e) {
                    await $quitApp(`Error starting zcoind: ${e}`);
                }

                this.setWaitingReason("Loading state from zcoind...");
                try {
                    await $daemon.awaitInitializersCompleted();
                } catch(e) {
                    await $quitApp(`Error running our initializers: ${e}`);
                }

                if ($daemon.isWalletLocked()) {
                    this.setWaitingReason(undefined);
                    // This wallet is already locked. End the setup procedure.
                    this.$store.commit("App/setIsInitialized", true);
                    // We will be destroyed automatically from MainLayout.
                } else {
                    // The wallet exists, but isn't yet locked. This is probably the result of some form of error.
                    if (await $daemon.hasBeenUsed()) {
                        await $quitApp(`You have an existing, unlocked wallet.dat (located at ${this.walletLocation}) ` +
                              "with addresses in it. Try locking it and starting the client again.");
                    } else {
                        await $quitApp("It looks like you have an existing wallet.dat, but it has no addresses in it. " +
                              "This is probably the result of a bug or the client exiting before setup could be " +
                              `completed. Manually backup the existing wallet.dat (located at ${this.walletLocation}) ` +
                              "and try starting the client again.");
                    }
                }
            } else {
                // wallet.dat doesn't exist, so we should set it up with a mnemonic.
                this.actions.goTo("createOrRestore");
            }
        }
    }
}
</script>

<style scoped lang="scss">
#config-options {
    display: table;

    label {
        font-size: 1.2em;
        padding-right: 0.5em;
    }

    #datadir {
        #datadir-value {
            font-weight: bold;
        }

        #change-datadir {
            font: {
                style: italic;
                size: 0.9em;
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
</style>
