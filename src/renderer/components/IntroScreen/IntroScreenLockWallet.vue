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

        async lockWallet() {
            const mnemonic = this.actions.getCachedMnemonic();

            let initialDaemon;
            try {
                this.$log.info("Starting zcoind with mnemonic and no initializers or handlers...");
                initialDaemon = new Zcoind(this.zcoinClientNetwork, this.zcoindLocation, this.blockchainLocation, [], {});
                await initialDaemon.start(mnemonic);
            } catch(e) {
                this.$log.error(`Failed to start zcoind with mnemonic: ${e}`);
                alert(`Failed to start zcoind with mnemonic: ${e}`);
                app.exit(-1);
            }

            await initialDaemon.awaitBlockIndex();

            try {
                this.$log.info("Trying to lock the wallet... This will shutdown zcoind.");
                // This call will shutdown zcoind.
                await initialDaemon.setPassphrase(null, this.passphrase);
            } catch(e) {
                this.$log.error("Something unexpected went wrong with locking the wallet, so we can't proceed.");
                alert("Something unexpected went wrong with locking the wallet, so we can't proceed. Please report this to the Zcoin team.");
                app.exit(-1);
            }

            this.$log.info("Waiting for zcoind to stop listening so we can restart it...");
            await initialDaemon.awaitZcoindNotListening();

            this.$log.info("Starting zcoind normally...");
            try {
                this.$log.info("Starting zcoind with mnemonic and no initializers or handlers...");
                window.$daemon = await zcoind(this.$store, this.zcoinClientNetwork, this.zcoindLocation, this.blockchainLocation);
            } catch(e) {
                this.$log.error(`Failed to start zcoind normally: ${e}`);
                alert(`Failed to start zcoind normally: ${e}`);
                app.exit(-1);
            }

            try {
                this.$log.info("Waiting for initializers to complete...");
                await $daemon.awaitInitializersCompleted();
            } catch(e) {
                this.$log.error(`initializers failed to complete: ${e}`);
                alert(`initializers failed to complete: ${e}`);
                app.exit(-1);
            }

            this.$log.info("Sanity checking mnemonic...");
            const mnemonicSanityCheck = await $daemon.showMnemonics(this.passphrase);
            if (mnemonicSanityCheck !== mnemonic.mnemonic) {
                // This should never happen.
                this.$log.error("Mnemonic sanity check failed. This is a bug.");
                alert("Mnemonic sanity check failed; this is a bug in the client.\n\n" +
                      `Mnemonic we tried to set: ${mnemonic.mnemonic}\n` +
                      `Mnemonic zcoind gave us: ${mnemonicSanityCheck}\n\n` +
                       "Seek help from the Zcoin team; do not try to use the client again."
                );
                app.exit(-1);
            }
            this.$log.info("Mnemonic sanity check passed.");

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
