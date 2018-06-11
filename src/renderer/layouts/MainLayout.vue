<template>
    <div class="main-layout wrapper" :class="{ 'has-overlay': hasOpenOverlay }">
        <transition name="fade" :duration="overlayDuration">
            <IntroScreen v-show="showIntroScreen" />
        </transition>

        <NotificationCenter />

        <transition name="fade" :duration="overlayDuration">
            <ConnectivityOverlay v-show="!networkIsConnected" />
        </transition>
        <transition name="fade" :duration="overlayDuration">
            <div class="active-window-overlay" v-show="hasOpenModal"></div>
        </transition>
        <!--<header class="header">
            Header
        </header>-->
        <!--<Sidebar class="aside"></Sidebar>-->
        <main class="main">
            <transition name="fade">
                <router-view class="child"></router-view>
            </transition>
        </main>
        <!--<footer class="footer"></footer>-->
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { sleep } from '../../lib/utils'
    import types from '~/types'

    // import Sidebar from '@/components/Sidebar'
    import NotificationCenter from '@/components/NotificationCenter'
    import ConnectivityOverlay from '@/components/ConnectivityOverlay'
    import IntroScreen from '@/components/IntroScreen'

    export default {
        name: 'MainLayout',
        components: {
            IntroScreen,
            // Sidebar,
            NotificationCenter,
            ConnectivityOverlay
        },
        async created () {
            await sleep(1000)
            this.overlayDuration = 1000
            // this.$store.dispatch(types.app.HIDE_INTRO_SCREEN)
            console.log(types.app.HIDE_INTRO_SCREEN)
        },

        data () {
            return {
                show: false,
                overlayDuration: 100
            }
        },

        computed: {
            ...mapGetters({
                hasOpenModal: 'Window/hasOpenModal',
                networkIsConnected: 'Network/isConnected',
                showIntroScreen: 'App/showIntroScreen'
            }),

            hasOpenOverlay () {
                return this.hasOpenModal || !this.networkIsConnected || this.showIntroScreen
            }
        }
    }
</script>

<style lang="scss">
    @import '../styles';

    .main-layout {
        min-height: 100vh;
        max-width: 100vw;
        box-sizing: border-box;

        &.has-overlay {
            .header,
            .sidebar,
            .main,
            .footer {
                filter: blur(1rem);
                transition: filter 1s linear;
            }
        }
    }

    .main-layout.wrapper {
        position: relative;
        display: grid;
        //grid-template-areas: "sidebar header header header header header header header header"
        grid-template-areas: "sidebar main main main main main main main main"
        "sidebar main main main main main main main main"
        "sidebar main main main main main main main main";
        // "sidebar footer footer footer footer footer footer footer footer";
        grid-template-rows: emRhythm(3*$base-line-multi) auto emRhythm($base-line-multi);
        grid-template-columns: minmax(min-content, 15rem) auto;

        overflow: hidden;

        & > div,
        & > section {
            box-sizing: border-box;
        }
    }

    .active-window-overlay {
        position: absolute;
        background: rgba($color--dark, 0.7);
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1000;
        transition: opacity 0.15s ease-out;
    }

    .header {
        grid-area: header;
    }

    .aside {
        grid-area: sidebar;
    }

    .main {
        grid-area: main;

        margin-top: $overlay--blur-offset-neg;
        padding-top: $overlay--blur-offset;

        margin-right: $overlay--blur-offset-neg;
        padding-right: $overlay--blur-offset;

        margin-bottom: $overlay--blur-offset-neg;
        padding-bottom: $overlay--blur-offset;
    }

    .footer {
        grid-area: footer;
    }

    .header, .footer {
        background-color: $color--polo;
        color: #333;
        text-align: center;
        line-height: 60px;
    }

    .aside {
        background-color: #D3DCE6;
        color: #333;
        text-align: center;
    }

    .main {
        position: relative;
        background: $color--polo-light;
        // padding: 0 emRhythm(5);

        @include lato-font('light');
        color: $color--dark;

        & > section {
            position: absolute;
            box-sizing: border-box;
        }

        @include typography();

        .child {
            width: 100%;
            height: 100vh;
            overflow-y: scroll;
            padding-right: $overlay--blur-offset;
        }
    }

    @keyframes animate--text-shadow-green-bright {
        to {
            color: $color--green-bright;
            text-shadow: 0 0 10px $color--green-bright,
            0 0 3px $color--green-bright;
        }
    }
</style>
