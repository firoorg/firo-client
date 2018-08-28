<template>
    <div class="overlay centered">
        <div class="grid" ref="grid">
            <main class="content" :class="getCurrentSettingsClass">
                <header>
                    <zcoin-logo-text class="logo" v-show="!goingToHide" />
                    <multi-step-popover :is-open="showIntro"
                                        placement="right-center"
                                        :steps="steps"
                                        :current-step="currentStep"
                                        :boundaries-element="$refs.grid"
                                        :actions="getActions"
                                        :delay="{ show: 350, hide: 0 }"
                                        popover-class="dark overlay-popover"
                                        :can-blur="false"
                                        @step-change="onStepChange">
                        <a href="#" class="logo-trigger">click</a>
                    </multi-step-popover>
                </header>

                <div v-show="!goingToHide">
                    Loading Wallet...
                </div>

                <footer>
                </footer>
            </main>
        </div>
    </div>
</template>

<script>
    // import Vue from 'vue'
    import { sleep } from '#/lib/utils'
    import GuideMixin from '@/mixins/GuideMixin'
    import types from '~/types'

    import ZcoinLogoText from '@/components/Icons/ZcoinLogoText'

    import MultiStepPopover from '@/components/Notification/MultiStepPopover'
    import IntroScreenWelcome from '@/components/IntroScreen/IntroScreenWelcome'
    import IntroScreenBlockchainLocation from '@/components/IntroScreen/IntroScreenBlockchainLocation'
    import IntroScreenLockWallet from '@/components/IntroScreen/IntroScreenLockWallet'
    import IntroScreenOther from '@/components/IntroScreen/IntroScreenOther'

    export default {
        name: 'IntroScreen',

        mixins: [
            GuideMixin
        ],

        components: {
            MultiStepPopover,
            ZcoinLogoText,
            IntroScreenWelcome,
            IntroScreenBlockchainLocation,
            IntroScreenLockWallet,
            IntroScreenOther
        },
        async created () {
            await sleep(2000)
            // todo check welcome guide status here and start the tour / settings / changelog etc.
            this.isReady = true
        },

        mounted () {
            this.$on('step-change', this.onStepChange)
        },

        beforeDestroy () {
            this.$off('step-change', this.onStepChange)
        },

        data () {
            return {
                isReady: false,
                goingToHide: false,
                steps: {
                    welcome: IntroScreenWelcome,
                    location: IntroScreenBlockchainLocation,
                    lock: IntroScreenLockWallet,
                    other: IntroScreenOther
                },
                currentStep: 'welcome',
                currentSettingsValue: ''
            }
        },

        computed: {
            getCurrentSettingsClass () {
                const classes = [
                    this.showIntro ? 'is-open' : ''
                ]

                classes.push('setting-' + this.currentSettingsValue
                    .replace('IntroScreen', '')
                    .toLowerCase())

                return classes.join(' ')
            },
            showIntro () {
                return this.isReady && this.$store.getters['App/showIntroScreen']
            },
            getActions () {
                return {
                    prev: this.prevStep,
                    next: this.nextSettingsStep,
                    goTo: this.goToStep
                }
            }
        },

        methods: {
            nextSettingsStep () {
                if (this.nextStep()) {
                    return
                }

                this.isReady = false
                this.goingToHide = true

                setTimeout(() => {
                    console.log(types.app.HIDE_INTRO_SCREEN)
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