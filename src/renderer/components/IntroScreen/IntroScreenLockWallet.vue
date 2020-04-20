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
import Vue from 'vue';
import { mapGetters } from 'vuex'

import GuideStepMixin from '@/mixins/GuideStepMixin'
import EventBusMixin from '@/mixins/EventBusMixin'

import IntroScreenLockWalletCreate from './IntroScreenLockWalletCreate'
import IntroScreenLockWalletConfirm from './IntroScreenLockWalletConfirm'
import IntroScreenLockWalletWarning from './IntroScreenLockWalletWarning'

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

            try {
                window.$daemon = await zcoind(this.$store, this.zcoinClientNetwork, this.zcoindLocation, this.blockchainLocation, mnemonic);
            } catch(e) {
                this.$log.error(`Failed to start zcoind: ${e}`);
                alert(`Failed to start zcoind: ${e}`);
                app.exit(-1);
            }

            await $daemon.awaitInitializersCompleted();

            try {
                this.$log.info("Trying to lock the wallet... This will shutdown zcoind.");
                // This call will shutdown zcoind.
                await $daemon.setPassphrase(null, this.passphrase);
            } catch(e) {
                alert("Something unexpected went wrong with locking the wallet, so we can't proceed. Please report this to the Zcoin team.");
                app.exit(-1);
            }

            this.$log.info("Waiting for zcoind to stop listening so we can restart it...");
            await $daemon.awaitZcoindNotListening();

            this.$log.info("Restarting zcoind...");
            await $daemon.start();

            this.$log.info("Waiting for initializers to complete...");
            await $daemon.awaitInitializersCompleted();

            const mnemonicSanityCheck = await $daemon.showMnemonics(this.passphrase);
            if (mnemonicSanityCheck !== mnemonic.mnemonic) {
                // This should never happen.
                alert("Mnemonic sanity check failed; this is a bug in the client.\n" +
                      `Mnemonic we tried to set: ${mnemonic.mnemonic}\n` +
                      `Mnemonic zcoind gave us: ${mnemonicSanityCheck}\n` +
                       "Seek help from the Zcoin team; do not try to use the client again."
                );
                app.exit(-1);
            }
            this.$log.info("Mnemonic sanity check passed.");

            $store.commit('App/setIsInitialized', true);
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
