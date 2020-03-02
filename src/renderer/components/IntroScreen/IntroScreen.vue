<template>
    <div class="overlay centered">
        <div
            ref="grid"
            class="grid"
        >
            <main
                class="content"
                :class="getCurrentSettingsClass"
            >
                <header>
                    <zcoin-logo-text
                        v-show="!goingToHide"
                        class="logo"
                    />
                    <multi-step-popover
                        :is-open="showIntro"
                        placement="right-center"
                        :steps="steps"
                        :current-step="currentStep"
                        :boundaries-element="$refs.grid"
                        :actions="getActions"
                        :delay="{ show: 350, hide: 0 }"
                        popover-class="dark overlay-popover"
                        :can-blur="false"
                        event-bus-name="popover:intro"
                        @step-change="onStepChange"
                    >
                        <a
                            href="#"
                            class="logo-trigger"
                        >
                            click
                        </a>
                    </multi-step-popover>
                </header>

                <div v-show="!isReadyInitialOrRestarting">
                    <div class="message-wrap">
                        <div class="loading-wrap">
                            <loading-bounce
                                color="dark"
                                class="loading"
                            />
                        </div>

                        {{ loadingMessage }}
                    </div>
                </div>

                <footer />
            </main>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GuideMixin from '@/mixins/GuideMixin'
import types from '~/types'

import ZcoinLogoText from '@/components/Icons/ZcoinLogoText'
import LoadingBounce from '@/components/Icons/LoadingBounce'

import MultiStepPopover from '@/components/Notification/MultiStepPopover'
import IntroScreenWelcome from '@/components/IntroScreen/IntroScreenWelcome'
import IntroScreenBlockchainLocation from '@/components/IntroScreen/IntroScreenBlockchainLocation'
import IntroScreenSettingUpLocation from '@/components/IntroScreen/IntroScreenSettingUpLocation'
import IntroScreenLockWallet from '@/components/IntroScreen/IntroScreenLockWallet'
import IntroScreenRestartingDaemon from '@/components/IntroScreen/IntroScreenRestartingDaemon'
import IntroScreenAmountToHoldInZerocoin from '@/components/IntroScreen/IntroScreenAmountToHoldInZerocoin'
import IntroScreenOther from '@/components/IntroScreen/IntroScreenOther'
import CreateOrRestore from '../Mnemonics/CreateOrRestore.vue'
import CreateNewWallet from '../Mnemonics/CreateNewWallet.vue'

export default {
    name: 'IntroScreen',

    components: {
        LoadingBounce,
        MultiStepPopover,
        ZcoinLogoText,
        IntroScreenWelcome,
        IntroScreenBlockchainLocation,
        IntroScreenSettingUpLocation,
        IntroScreenLockWallet,
        IntroScreenRestartingDaemon,
        IntroScreenAmountToHoldInZerocoin,
        IntroScreenOther
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
                settingUpLocation: IntroScreenSettingUpLocation,
                lock: IntroScreenLockWallet,
                restart: IntroScreenRestartingDaemon
                // amountToHoldInZerocoin: IntroScreenAmountToHoldInZerocoin,
                // other: IntroScreenOther
            },
            currentStep: 'welcome',
            currentSettingsValue: ''
        }
    },

    computed: {
        ...mapGetters({
            isReady: 'App/isReady',
            isRestarting: 'App/isRestarting',
            isRunning: 'App/isRunning',
            isInitialRun: 'App/isInitialRun',
            currentBlockHeight: 'Blockchain/currentBlockHeight',
            showIntroScreen: 'App/showIntroScreen'
        }),

        getCurrentSettingsClass () {
            const classes = [
                this.showIntro ? 'is-open' : ''
            ]

            classes.push('setting-' + this.currentSettingsValue
                .replace('IntroScreen', '')
                .toLowerCase())

            return classes.join(' ')
        },
        isReadyInitialOrRestarting () {
            return this.isReady || this.isInitialRun || this.isRestarting
        },

        showIntro () {
            return this.isReadyInitialOrRestarting  && this.showIntroScreen
        },

        getActions () {
            return {
                prev: this.prevStep,
                next: this.nextSettingsStep,
                goTo: this.goToStep
            }
        },

        loadingMessage () {
            if (this.isRestarting) {
                return this.$t('overlay.loading.restarting-daemon')
            }
            else if (!this.currentBlockHeight) {
                return this.$t('overlay.loading.loading-blockchain')
            }
            else if (this.isRunning) {
                return this.$t('overlay.loading.loading-wallet')
            }
            else {
                return this.$t('overlay.loading.initial')
            }
        }
    },

    mounted () {
        this.$on('step-change', this.onStepChange)
    },

    beforeDestroy () {
        this.$off('step-change', this.onStepChange)
    },

    methods: {
        nextSettingsStep () {
            if (this.nextStep()) {
                return
            }

            this.goingToHide = true

            setTimeout(() => {
                this.$store.dispatch(types.app.HIDE_INTRO_SCREEN)
            }, 500)
        }
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
