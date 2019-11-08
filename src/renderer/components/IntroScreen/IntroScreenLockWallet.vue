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
        :is-equal="isEqual"
    />
    <component
        :is="'IntroScreenLockWalletWarning'"
        v-else
        :prev="actions.prev"
        :next="onLockWallet"
    />
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import types from '~/types'

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
            isLocked: 'ApiStatus/isLocked',
            hasApiStatus: 'ApiStatus/hasApiStatus'
        }),
        isEqual () {
            return this.passphrase === this.confirm
        }
    },

    watch: {
        isLocked (newVal) {
            if (newVal) {
                this.actions.next()
            }
        }
    },

    methods: {
        ...mapActions({
            lockWallet: types.app.LOCK_WALLET
        }),
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
        onLockWallet () {
            this.lockWallet(this.passphrase)
            this.actions.next()
        },
        isEnabled () {
            this.$log.debug('is locked: %O', this.isLocked)
            return this.isLocked !== true
        }
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
