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
                            <h1>Tello Borld</h1>

                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea exercitationem hic minus repellendus temporibus.
                            </p>
                        </template>

                        <template slot="footer">
                            <BaseButton
                                    color="green"
                                    is-popover
                                    @click="closeTour"
                            >Ok, let's go!</BaseButton>
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
    import ZcoinLogo from '@/assets/zcoin-logo-text.svg'
    import { sleep } from '../../lib/utils'
    import types from '~/types'

    export default {
        name: 'IntroScreen',
        components: {
            ZcoinLogo
        },
        async created () {
            await sleep(2000)
            // todo check welcome guide status here and start the tour / settings / changelog etc.
            this.isReady = true
        },

        data () {
            return {
                isReady: false
            }
        },

        computed: {
            showIntro () {
                return this.isReady && this.$store.getters['App/showIntroScreen']
            }
        },

        methods: {
            async closeTour () {
                this.isReady = false
                await sleep(250)
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
        border: 1px solid yellow;
        text-align: right;
        line-height: 100px;
        opacity: 0;
    }

    .logo-trigger {
    }
</style>