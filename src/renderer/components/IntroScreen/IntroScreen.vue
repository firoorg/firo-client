<template>
    <div class="overlay centered">
        <div
            ref="grid"
            class="grid"
        >
            <main class="content">
                <div>
                    <zcoin-logo-text class="logo" />
                    <multi-step-popover
                        placement="right-center"
                        :is-open="true"
                        :steps="steps"
                        :current-step="currentStep"
                        :boundaries-element="$refs.grid"
                        :actions="getActions"
                        :delay="{ show: 350, hide: 0 }"
                        popover-class="dark overlay-popover"
                        event-bus-name="popover:intro"
                        @step-change="onStepChange"
                    />
                </div>
            </main>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GuideMixin from '@/mixins/GuideMixin'

import ZcoinLogoText from '@/components/Icons/ZcoinLogoText'
import LoadingBounce from '@/components/Icons/LoadingBounce'

import MultiStepPopover from '@/components/Notification/MultiStepPopover'
import IntroScreenWelcome from '@/components/IntroScreen/IntroScreenWelcome'
import IntroScreenBlockchainLocation from '@/components/IntroScreen/IntroScreenBlockchainLocation'
import IntroScreenLockWallet from '@/components/IntroScreen/IntroScreenLockWallet'
import CreateOrRestore from '../Mnemonics/CreateOrRestore.vue'
import CreateNewWallet from '../Mnemonics/CreateNewWallet.vue'
import VerifyMnemonics from '../Mnemonics/VerifyMnemonics.vue'
import RestoreAskWalletOrigin from '../Mnemonics/RestoreAskWalletOrigin.vue'
import WalletRecovery from '../Mnemonics/WalletRecovery.vue'
import RecoveringWallet from '../Mnemonics/RecoveringWallet.vue'


export default {
    name: 'IntroScreen',

    components: {
        LoadingBounce,
        MultiStepPopover,
        ZcoinLogoText,
        IntroScreenWelcome,
        IntroScreenBlockchainLocation,
        IntroScreenLockWallet
    },

    mixins: [
        GuideMixin
    ],

    data () {
        return {
            goingToHide: false,
            steps: {
                welcome: IntroScreenWelcome,
                location: IntroScreenBlockchainLocation,
                createOrRestore: CreateOrRestore,
                createWallet: CreateNewWallet,
                verifyMnemonics: VerifyMnemonics,
                restoreAskWalletOrigin: RestoreAskWalletOrigin,
                walletRecover:WalletRecovery,
                recoveringWallet:RecoveringWallet,
                lock: IntroScreenLockWallet
            },
            currentStep: 'welcome'
        }
    },

    computed: {
        ...mapGetters({
            isReady: 'App/isReady',
            isRestarting: 'App/isRestarting',
            isRunning: 'App/isRunning',
            isInitialRun: 'App/isInitialRun',
            currentBlockHeight: 'Blockchain/currentBlockHeight',
            showIntroScreen: 'App/showIntroScreen',
            walletLoaded: 'Transactions/walletLoaded',
            isLocked: 'ApiStatus/isLocked',
            walletExist: 'App/walletExist'
        }),

        getActions() {
            return {
                goTo: this.goToStep,
                getCurrentStep: this.getCurrentStep,
                setWalletRecoveryType: this.setWalletRecoveryType,
                getWalletRecoveryType: this.getWalletRecoveryType,
                setWalletIndexComplete: this.setWalletIndexComplete,
                getWalletIndexComplete: this.getWalletIndexComplete,
                getCachedMnemonic: this.getCachedMnemonic,
                setCachedMnemonic: this.setCachedMnemonic,
                setIsMnemonicVerified: this.setIsMnemonicVerified,
                getIsMnemonicVerified: this.getIsMnemonicVerified
            }
        }
    },

    mounted () {
        this.$on('step-change', this.onStepChange)
    },

    beforeDestroy () {
        this.$off('step-change', this.onStepChange)
    }
}
</script>

<style lang="scss" scoped>
    .overlay {
        background: rgba($color--dark, 0.95);
        z-index: 20000;
    }

    .message-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        font-style: italic;
    }

    .loading-wrap {
        width: 35%;
        display: flex;
        justify-content: flex-end;
    }

    .loading {
        //margin: 0 auto;
        margin-right: emRhythm(2);
    }

    .content {
        transition: margin 0.25s ease-in-out;

        &.is-open {
            margin-right: 33%;
        }
    }

    header {
        position: relative;
    }

    .setting-blockchainlocation {
        // margin-left: -25%;
    }

    .logo {
        width: 20rem;
    }

    .popover {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 31.5%;
        // border: 1px solid yellow;
        text-align: right;
        line-height: 100px;
        opacity: 0;
    }

    .logo-trigger {
    }
</style>
