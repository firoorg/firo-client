<template>
    <intro-screen-lock-wallet-waiting
        v-if="!hasApiStatus"
    />
    <component
        :is="'IntroScreenLockWalletCreate'"
        v-else-if="!showConfirm"
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
        :prev="actions.prev"
        :next="onLockWallet"
    />
</template>

<script>
const app = require("electron").remote.app;
import { mapGetters } from 'vuex'

import GuideStepMixin from '@/mixins/GuideStepMixin'
import EventBusMixin from '@/mixins/EventBusMixin'

import IntroScreenLockWalletWaiting from './IntroScreenLockWalletWaiting'
import IntroScreenLockWalletCreate from './IntroScreenLockWalletCreate'
import IntroScreenLockWalletConfirm from './IntroScreenLockWalletConfirm'
import IntroScreenLockWalletWarning from './IntroScreenLockWalletWarning'

export default {
    name: 'IntroScreenLockWallet',
    components: {
        IntroScreenLockWalletWaiting,
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
            hasApiStatus: 'ApiStatus/hasApiStatus',
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

        async onLockWallet () {
            try {
                this.$log.info("Trying to lock the wallet...");
                console.log(`Using passphrase ${this.passphrase}`); // FIXME: Remove this.
                await this.$daemon.setPassphrase(null, this.passphrase);
            } catch(e) {
                alert("Something unexpected went wrong with locking the wallet, so we can't proceed. Please report this to the Zcoin team.");
                app.exit(-1);
            }

            this.actions.next()
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
