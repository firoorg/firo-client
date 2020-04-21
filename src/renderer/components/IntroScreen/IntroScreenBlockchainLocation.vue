<template>
    <div>
        <h1 v-html="$t('onboarding.set-blockchain-location.title')" />

        <p v-html="$t('onboarding.set-blockchain-location.description')" />

        <div v-if="!hasSelectedFolder">
            <BaseButton
                :is-outline="true"
                @click.once="continueSetup"
            >
                {{ $t('onboarding.set-blockchain-location.button__use-default-location--secondary') }}
            </BaseButton>

            <BaseButton
                color="green"
                @click="selectFolder"
            >
                {{ $t('onboarding.set-blockchain-location.button__select-folder--primary') }}
            </BaseButton>
        </div>

        <BaseButton
            v-else
            color="green"
            @click.once="continueSetup"
        >
            {{ $t('onboarding.set-blockchain-location.button__confirm-selection--primary') }}
        </BaseButton>
    </div>
</template>

<script>
import { existsSync } from 'fs'
import { mapGetters, mapMutations } from 'vuex'
import GuideStepMixin from '@/mixins/GuideStepMixin'

import zcoind from "#/daemon/init";

const remote = require('electron').remote;

export default {
    name: 'IntroScreenBlockchainLocation',

    mixins: [
        GuideStepMixin
    ],

    data: () => ({
        blockchainLocation: '',
        network: 'regtest' // FIXME: Allow the user to set the network.
    }),

    computed: {
        ...mapGetters({
            zcoindLocation: 'App/zcoindLocation',
            defaultZcoinRootDirectory: 'App/defaultZcoinRootDirectory',
            walletLocation: 'App/walletLocation'
        }),

        hasSelectedFolder() {
            return !!this.blockchainLocation;
        }
    },

    methods: {
        ...mapMutations({
            setWaitingReason: 'App/setWaitingReason'
        }),

        async selectFolder () {
            const [blockchainLocation] = remote.dialog.showOpenDialog({
                title: 'Select Zcoin Blockchain Location',
                properties: [
                    'openDirectory',
                    'createDirectory',
                    'promptToCreate',
                    'showHiddenFiles'
                ],
                buttonLabel: this.$t('onboarding.set-blockchain-location.button__select-location--primary')
            });

            this.blockchainLocation = blockchainLocation;
        },

        async continueSetup() {
            this.$log.info(`Setting zcoinClientNetwork: ${this.network}`);
            this.$store.commit('App/setZcoinClientNetwork', this.network);

            // Wait for setZcoinClientNetwork to propagate before continuing.
            await new Promise((r) => this.$nextTick(r));

            // changeBlockchainLocation needs to be called before walletLocation can be accessed.
            const dataDir = this.blockchainLocation || this.defaultZcoinRootDirectory;
            try {
                this.$log.info(`Setting blockchain location: ${dataDir}`);
                // Commit the blockchain location to our preferences file. setZcoinClientNetwork must be called before us.
                this.$store.commit('App/changeBlockchainLocation', dataDir);
            } catch (e) {
                // FIXME: Allow the user to reselect the location if the one they pick first is invalid.
                alert(`Blockchain location is invalid: ${e}`);
                remote.app.quit();
            }

            // Wait for changeBlockchainLocation to propagate before continuing.
            await new Promise((r) => this.$nextTick(r));

            // The wallet already exists, so we don't need to go through the mnemonics screen.
            if (existsSync(this.walletLocation)) {
                this.setWaitingReason("Starting zcoind...");
                window.$daemon = await zcoind(this.$store, this.network, this.zcoindLocation, dataDir);
                this.setWaitingReason("Loading state from zcoind...");
                await $daemon.awaitInitializersCompleted();

                if ($daemon.isWalletLocked()) {
                    this.setWaitingReason(undefined);
                    // This wallet is already locked. End the setup procedure.
                    this.$store.commit("App/setIsInitialized", true);
                    // We will be destroyed automatically from MainLayout.
                } else {
                    // The wallet exists, but isn't yet locked. This is probably the result of some form of error.
                    if (await $daemon.hasBeenUsed()) {
                        this.$log.info("The user has an existing, unlocked wallet.dat with addresses in it.");
                        alert(`You have an existing, unlocked wallet.dat (located at ${this.walletLocation} that ` +
                              "already generated addresses. Try locking it and starting the client again.");
                        remote.app.quit();
                    } else {
                        this.$log.error("The user has an existing, unlocked wallet.dat with no addresses.");
                        alert("It looks like you have an existing wallet.dat, but it has no addresses in it. This " +
                              "is probably the result of exiting the client before setup could be completed. Manually " +
                              `backup the existing wallet.dat (located at ${this.walletLocation}) and try starting ` +
                              "client again.");
                        remote.app.quit();
                    }
                }
            } else {
                this.setWaitingReason(undefined);
                // wallet.dat doesn't exist, so we should set it up with a mnemonic.
                this.actions.goTo("createOrRestore");
            }
        }
    }
}
</script>

<style scoped>

</style>
