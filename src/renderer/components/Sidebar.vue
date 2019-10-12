<template>
    <aside
        v-scrollable
        class="scrollable-dark"
    >
        <div class="sidebar">
            <div class="logo">
                <router-link to="/">
                    <svg viewBox="0 0 633 200">
                        <linearGradient
                            id="green-gradient"
                            x1="100%"
                            x2="0%"
                            y1="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0"
                                stop-color="#4aff83"
                            /><stop
                                offset="1"
                                stop-color="#23b852"
                            />
                        </linearGradient><mask
                            id="zcoin-mask"
                            fill="#fff"
                        >
                            <path
                                d="m0 0h200.905339v200h-200.905339z"
                                fill="#fff"
                                fill-rule="evenodd"
                            />
                        </mask><mask
                            id="fill-white"
                            fill="#fff"
                        >
                            <path
                                d="m528.179824 42.7692009h104.504486v119.3001491h-104.504486z"
                                fill="#fff"
                                fill-rule="evenodd"
                            />
                        </mask><g
                            fill="none"
                            fill-rule="evenodd"
                        >
                            <path
                                d="m130.824569 134.882432h37.791759v32.974356h-113.4965894l141.0568874-140.4212549c4.616931-4.5961497 5.997729-11.5088442 3.499448-17.51438513-2.498994-6.00554095-8.385403-9.92114797-14.915471-9.92114797h-168.6157575c-8.91702849 0-16.14427439 7.19542516-16.14427439 16.0716062v49.0459615h-.0007136v69.7648643l70.08030869-69.7648643h-37.7910462v-32.9743554h113.49659l-141.05688737 140.4205437c-4.61693139 4.596861-5.99844285 11.510265-3.49944846 17.515096 2.49899439 6.005541 8.38540351 9.921148 14.91547133 9.921148h168.6157575c8.916315 0 16.144274-7.195425 16.144274-16.071606v-49.045962-69.7648643z"
                                fill="url(#green-gradient)"
                                mask="url(#zcoin-mask)"
                            /><g fill="#fff">
                                <path d="m297.39792 42.4242424c19.57104 0 32.234654 7.6103129 38.451621 12.4531097 3.914493 2.5360588 4.144172 6.4565877 1.382339 10.3771166l-2.303186 3.4590389c-2.762544 4.151274-5.986578 4.3813068-10.361139 1.8445359-4.83534-3.4590389-13.815563-8.7626136-26.018398-8.7626136-23.485532 0-40.524418 17.5259393-40.524418 41.5091791 0 23.752494 17.038886 41.969956 40.985198 41.969956 14.045241 0 24.17599-6.456588 29.701789-10.607149 4.144882-2.767516 7.598595-2.306026 10.361139 2.07528l1.842407 3.459039c2.303186 3.919817 1.612017 7.610313-2.072086 10.147084-6.447357 5.303575-20.492599 14.297646-41.445266 14.297646-36.609926 0-62.168255-26.058521-62.168255-61.111111 0-34.5911014 25.788008-61.1111116 62.168255-61.1111116" /><path d="m405.73268 145.275164c22.050985 0 39.967721-17.526041 39.967721-41.970913 0-24.2134131-17.916736-41.5094205-39.967721-41.5094205-21.821856 0-39.96843 17.2960074-39.96843 41.5094205 0 24.444872 18.146574 41.970913 39.96843 41.970913m0-102.8509216c34.68499 0 62.707511 25.5971793 62.707511 60.8800086 0 35.514288-28.022521 61.342214-62.707511 61.342214-34.685699 0-62.479091-25.827926-62.479091-61.342214 0-35.2828293 27.793392-60.8800086 62.479091-60.8800086" /><path d="m483.583732 52.0863114c0-5.094578 2.747854-7.641867 7.556953-7.641867h7.097327c5.037498 0 7.556246 2.547289 7.556246 7.641867v101.8879836c0 5.094578-2.518748 7.641867-7.556246 7.641867h-7.097327c-4.809099 0-7.556953-2.547289-7.556953-7.641867z" /><path
                                    d="m528.179824 53.132891c0-5.0669774 2.738331-7.6004662 7.530764-7.6004662h6.388501c5.019335 0 7.529355 2.5334888 7.529355 7.6004662v10.3636902c0 3.4545634-.684231 6.6793915-.684231 6.6793915h.455919c4.564121-10.1339549 18.482681-27.4067718 43.809782-27.4067718 27.15289 0 39.474678 14.9697747 39.474678 44.6795888v67.0200943c0 5.066978-2.51002 7.600466-7.53006 7.600466h-7.073436c-4.791728 0-7.529355-2.533488-7.529355-7.600466v-61.9531169c0-16.3517422-3.194955-29.2489211-21.676932-29.2489211-22.361162 0-38.56143 18.885231-38.56143 43.067175v48.134863c0 5.066978-2.51002 7.600466-7.53006 7.600466h-7.072731c-4.792433 0-7.530764-2.533488-7.530764-7.600466z"
                                    mask="url(#fill-white)"
                                />
                            </g>
                        </g>
                    </svg>
                    <div
                        v-if="network === 'test'"
                        class="is-testnet-badge"
                    >
                        Testnet
                    </div>
                    <div
                        v-else-if="network === 'regtest'"
                        class="is-testnet-badge"
                    >
                        Regtest
                    </div>
                </router-link>
            </div>

            <Balance class="balance" />
            <main-menu class="menu" />

            <!--<settings class="settings"></settings>-->
            <blockchain class="blockchain" />
        </div>
    </aside>
</template>

<script>
import { mapGetters } from 'vuex'

import Balance from '@/components/Sidebar/Balance'
import Menu from '@/components/Sidebar/Menu'
import Settings from '@/components/Sidebar/Settings'
import Blockchain from '@/components/Sidebar/Blockchain'

export default {
    name: 'Sidebar',
    components: {
        Balance,
        'main-menu': Menu,
        Settings,
        Blockchain
    },

    computed: {
        ...mapGetters({
            network: 'Network/network'
        })
    }
}
</script>

<style lang="scss" scoped>
    aside {
        height: 100vh;
        overflow: hidden;

        // This is required to have the sidebar not compress when long strings are entered into the debug console.
        width: max-content;
    }

    .sidebar {
        //background-image: $gradient--comet-dark-horizontal;
        background-image: linear-gradient(to top right, $color--dark, $color--comet-dark-mixed);

        display: grid;
        grid-row-gap: emRhythm(2);
        grid-template-areas: "logo" "balance" "menu" "blockchain";
        $logo-height: $sidebar--logo-margin-top + $sidebar--logo-height + $sidebar--logo-margin-bottom;
        grid-template-rows: emRhythm($logo-height) min-content auto 3rem;
        color: #fff;

        -webkit-user-select: none;
        -webkit-app-region: drag;
        min-height: 100%;
    }

    .logo {
        grid-area: logo;

        margin: emRhythm($sidebar--logo-margin-top) 0 emRhythm($sidebar--logo-margin-bottom);
        height: emRhythm($sidebar--logo-height);

        a {
            display: block;
            height: 100%;
        }

        .is-testnet-badge {
            color: $color--dark;
            background-color: transparent;
            background: $color--red-bright;
            vertical-align: text-top;
            padding: 0.125rem 0.5rem;
            margin: 0.5rem auto 0;
            display: inline-block;
            border-radius: 0.125rem;
            @include font-medium()
        }

        /deep/ svg {
            @include drop-shadow-large();
            width: auto;
            max-height: 100%;
        }
    }

    .balance {
        grid-area: balance;
    }

    .menu {
        grid-area: menu;

        .el-menu-item {
            position: relative;
        }
    }

    .settings {
        grid-area: settings;
        align-self: end;
    }

    .blockchain {
        align-self: end;
        grid-area: blockchain;
    }
</style>
