<template>
    <div class="overlay centered">
        <div class="grid">
            <main class="content" :class="getCurrentSettingsClass">
                <header>
                    <zcoin-logo-text class="logo" />
                    <base-popover
                            :open="showIntro"
                            placement="right-center"
                            popover-class="dark"
                    >
                        <template slot="target">
                            <a href="#" class="logo-trigger">click</a>
                        </template>

                        <template slot="content">
                            <component
                                    :is="currentSettings"
                                    :onNext="nextSettingsStep"
                            />
                        </template>
                    </base-popover>
                </header>
                Loading Wallet...
                <footer>
                </footer>
            </main>
        </div>
    </div>
</template>

<script>
    // import Vue from 'vue'
    import { sleep } from '../../../lib/utils'
    import types from '~/types'

    import ZcoinLogoText from '@/components/Icons/ZcoinLogoText'

    import IntroScreenWelcome from '@/components/IntroScreen/IntroScreenWelcome'
    import IntroScreenBlockchainLocation from '@/components/IntroScreen/IntroScreenBlockchainLocation'
    import IntroScreenOther from '@/components/IntroScreen/IntroScreenOther'

    export default {
        name: 'IntroScreen',
        components: {
            ZcoinLogoText,
            IntroScreenWelcome,
            IntroScreenBlockchainLocation,
            IntroScreenOther
        },
        async created () {
            /*
            const v = new Vue({
                ...IntroScreenWelcome,
                store: this.$store
            })
            console.log(v)
            console.log(v.foobar())
             */

            await sleep(2000)
            // todo check welcome guide status here and start the tour / settings / changelog etc.
            this.isReady = true
        },

        data () {
            return {
                isReady: false,
                settings: [
                    'IntroScreenWelcome',
                    'IntroScreenBlockchainLocation',
                    'IntroScreenOther'
                    /*
                    'IntroScreenSelectBlockchainLocation',
                     */
                ],
                currentSettingsValue: ''
            }
        },

        computed: {
            currentSettings () {
                return this.currentSettingsValue || this.settings[0]
            },
            getCurrentSettingsClass () {
                return 'setting-' + this.currentSettings.replace('IntroScreen', '').toLowerCase()
            },
            showIntro () {
                return this.isReady && this.$store.getters['App/showIntroScreen']
            }
        },

        methods: {
            async nextSettingsStep () {
                if (this.settings[this.settings.length - 1] !== this.currentSettings) {
                    const currentPosition = this.settings.indexOf(this.currentSettings)
                    this.currentSettingsValue = this.settings[currentPosition + 1]
                    return
                }

                this.isReady = false
                await sleep(500)
                this.$store.dispatch(types.app.HIDE_INTRO_SCREEN)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .overlay {
        background: rgba($color--dark, 0.95);
    }

    .content {
        transition: margin 0.25s ease-out;
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