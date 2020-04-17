<template>
    <div>
        <h1 v-html="$t('onboarding.set-blockchain-location.title')" />

        <p v-html="$t('onboarding.set-blockchain-location.description')" />

        <div v-if="!hasSelectedFolder">
            <BaseButton
                :is-outline="true"
                @click.once="startDaemon"
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
            @click.once="startDaemon"
        >
            {{ $t('onboarding.set-blockchain-location.button__confirm-selection--primary') }}
        </BaseButton>
    </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import GuideStepMixin from '@/mixins/GuideStepMixin'

import zcoind from "#/daemon/init";
import store from "#/store/renderer";

const remote = require('electron').remote;

export default {
    name: 'IntroScreenBlockchainLocation',

    mixins: [
        GuideStepMixin
    ],

    data: () => ({
        blockchainLocation: ''
    }),

    computed: {
        ...mapGetters({
            zcoindLocation: 'App/zcoindLocation'
        }),

        hasSelectedFolder() {
            return !!this.blockchainLocation;
        }
    },

    methods: {
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

        async startDaemon () {
            if (this.blockchainLocation) {
                try {
                    // Commit the blockchain location to our preferences file. It MAY be the empty string.
                    await this.$store.dispatch('App/changeBlockchainLocation', this.blockchainLocation);
                } catch (e) {
                    // FIXME: Allow the user to reselect the location if the one they pick first is invalid.
                    alert(`Blockchain location is invalid: ${e}`);
                    app.exit(-1);
                }
            }

            try {
                window.$daemon = await zcoind(store, this.zcoindLocation, this.blockchainLocation || null);
                Vue.prototype.$daemon = window.$daemon;
            } catch(e) {
                alert(`Couldn't start zcoind: ${e}`);
                remote.app.exit(-1);
            }

            if (this.$daemon.isWalletLocked()) {
                // This wallet is already locked. End the setup procedure.
                await this.$store.dispatch("App/setIsInitialized");
            } else if (await this.$daemon.hasBeenUsed()) {
                // This means that the wallet has been used but is unencrypted. We will prompt the user to lock it, but
                // not show the mnemonic setup screen.
                this.actions.goTo("lock");
            } else {
                // This path is taken when the user is legitimately setting up a new wallet.
                this.actions.goTo("createOrRestore");
            }
        }
    }
}
</script>

<style scoped>

</style>
