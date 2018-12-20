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

import IntroScreenLockWalletCreate from './IntroScreenLockWalletCreate'
import IntroScreenLockWalletConfirm from './IntroScreenLockWalletConfirm'
import IntroScreenLockWalletWarning from './IntroScreenLockWalletWarning'

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
            isLocked: 'App/isLocked'
        }),
        isEqual () {
            return this.passphrase === this.confirm
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
            return !this.isLocked
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
