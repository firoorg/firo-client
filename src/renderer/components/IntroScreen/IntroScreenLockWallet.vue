<template>
    <component
        :is="'IntroScreenLockWalletCreate'"
        v-if="!showConfirm"
        :passphrase.sync="passphrase"
        :go-to-confirm="goToConfirm"
    />
    <component
        :is="'IntroScreenLockWalletConfirm'"
        v-else-if="!isConfirmed"
        :on-cancel="onConfirmCancel"
        :on-confirm="onConfirm"
        :confirm.sync="confirm"
        :target-passphrase="passphrase"
    />
    <component
        :is="'IntroScreenLockWalletWarning'"
        v-else
        :prev="reenterPassphrase"
        :next="lockWallet"
    />
</template>

<script>
import { mapGetters } from 'vuex'

import GuideStepMixin from '@/mixins/GuideStepMixin'
import EventBusMixin from '@/mixins/EventBusMixin'

import IntroScreenLockWalletCreate from './IntroScreenLockWalletCreate'
import IntroScreenLockWalletConfirm from './IntroScreenLockWalletConfirm'
import IntroScreenLockWalletWarning from './IntroScreenLockWalletWarning'

import {Zcoind} from "#/daemon/zcoind";
import zcoind from "#/daemon/init";
const app = require("electron").remote.app;

export default {
    name: 'IntroScreenLockWallet',

    components: {
        IntroScreenLockWalletCreate,
        IntroScreenLockWalletConfirm,
        IntroScreenLockWalletWarning
    },

    mixins: [
        GuideStepMixin,
        EventBusMixin
    ],

    data () {
        return {
            eventBusName: 'popover:intro',
            passphrase: '',
            isValidPassphrase: false,
            confirm: '',
            showConfirm: false,
            isConfirmed: false
        }
    },

    computed: {
        ...mapGetters({
            zcoinClientNetwork: 'App/zcoinClientNetwork',
            zcoindLocation: 'App/zcoindLocation',
            blockchainLocation: 'App/blockchainLocation'
        })
    },

    methods: {
        goToConfirm () {
            this.eventBus.$emit('reflow')
            this.showConfirm = true
            this.confirm = ''
        },

        onConfirm () {
            this.eventBus.$emit('reflow')
            this.isConfirmed = true
        },

        onConfirmCancel () {
            this.eventBus.$emit('reflow')
            this.showConfirm = false
            this.confirm = ''
            this.passphrase = ''
        },

        reenterPassphrase() {
            this.passphrase = '';
            this.confirm = '';
            this.showConfirm = false;
            this.isConfirmed = false;
            this.eventBus.$emit('reflow');
        },

        // Log reason at info level and put up a loading screen showing why we're waiting. reason may be undefined, in
        // which case the screen will go away.
        async setWaitingReason(reason) {
            if (reason) {
                this.$log.info(reason);
            }

            this.$store.commit('App/setWaitingReason', reason);
            await new Promise(r => this.$nextTick((r))); // await UI update
        },

        async lockWallet() {
            await this.setWaitingReason("Telling zcoind to start and reindex with our mnemonic...");
            const mnemonic = this.actions.getCachedMnemonic();
            let initialDaemon;
            try {
                initialDaemon = new Zcoind(this.zcoinClientNetwork, this.zcoindLocation, this.blockchainLocation, [], {});
                await initialDaemon.start(mnemonic);
            } catch(e) {
                await $quitApp(`Failed to start zcoind with mnemonic: ${e}`);
            }

            await this.setWaitingReason("Waiting for zcoind API to be ready...");
            await initialDaemon.awaitApiIsReady();

            await this.setWaitingReason("Locking the wallet...");
            try {
                // This call will shutdown zcoind.
                await initialDaemon.setPassphrase(null, this.passphrase);
            } catch(e) {
                await $quitApp("Something unexpected went wrong with locking the wallet, so we can't proceed.");
            }

            await this.setWaitingReason("Waiting for zcoind to stop listening so we can restart it...");
            await initialDaemon.awaitZcoindNotListening();

            await this.setWaitingReason("Starting zcoind..");
            try {
                window.$daemon = await zcoind(this.$store, this.zcoinClientNetwork, this.zcoindLocation, this.blockchainLocation);
            } catch(e) {
                await $quitApp(`Failed to start zcoind normally: ${e}`);
            }

            await this.setWaitingReason("Waiting to update our state with data from zcoind...");
            try {
                await $daemon.awaitInitializersCompleted();
            } catch(e) {
                await $quitApp(`initializers failed to complete: ${e}`);
            }

            await this.setWaitingReason("Sanity checking mnemonic...");
            const mnemonicSanityCheck = await $daemon.showMnemonics(this.passphrase);
            if (mnemonicSanityCheck !== mnemonic.mnemonic) {
                // This should never happen.
                await $quitApp("Mnemonic sanity check failed. This is a bug. Seek help from the Zcoin team; do not try to use the client again.");
            }
            this.$log.info("Mnemonic sanity check passed.");
            this.setWaitingReason(undefined);

            this.$log.info("Marking app as initialized...");
            this.$store.commit('App/setIsInitialized', true);
            // We will be destroyed automatically from MainLayout.
        },
    }
}
</script>

<style lang="scss" scoped>
    .form {
        margin-top: emRhythm(7);
    }
    .form .control input {
        // @include green-input();
    }

    .form .control.passphrase {
        display: flex;
        padding-right: 0;
    }

    .form .control.passphrase input[type="text"] {
        flex-grow: 1;
        width: 1%;
    }
</style>
