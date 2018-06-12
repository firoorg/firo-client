<template>
    <div class="overlay centered">
        <div class="grid">
            <main class="content">
                <header>
                    <ZcoinLogo class="logo" />
                    <BasePopover
                            :open="showIntro"
                            placement="right-center"
                            popover-class="dark"
                    >
                        <template slot="target">
                            <a href="#" class="logo-trigger">click</a>
                        </template>

                        <template slot="content">
                            <component
                                    :is="currentSetting"
                                    :onNext="nextSettingsStep"
                            />
                        </template>
                    </BasePopover>
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
    import ZcoinLogo from '@/assets/zcoin-logo-text.svg'
    import { sleep } from '../../lib/utils'
    import types from '~/types'

    import IntroScreenWelcome from '@/components/IntroScreenWelcome'
    import IntroScreenOther from '@/components/IntroScreenOther'

    export default {
        name: 'IntroScreen',
        components: {
            ZcoinLogo,
            IntroScreenWelcome,
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
                    'IntroScreenOther'
                    /*
                    'IntroScreenSelectBlockchainLocation',
                     */
                ],
                currentSettingValue: ''
            }
        },

        computed: {
            currentSetting () {
                return this.currentSettingValue || this.settings[0]
            },
            showIntro () {
                return this.isReady && this.$store.getters['App/showIntroScreen']
            }
        },

        methods: {
            async nextSettingsStep () {
                if (this.settings[this.settings.length - 1] !== this.currentSetting) {
                    const currentPosition = this.settings.indexOf(this.currentSetting)
                    this.currentSettingValue = this.settings[currentPosition + 1]
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

    header {
        position: relative;
    }
    .logo {
        width: 20rem;
        @include drop-shadow();
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