<template>
    <div id="sidebar">
        <div id="logo">
            <router-link to="/main">
                <FiroLogoDark class="logo-dark" />
                <FiroLogoWhite class="logo-white" />
            </router-link>
        </div>

        <div v-if="network === 'test'" class="network-badge">
            Testnet
        </div>
        <div v-else-if="network === 'regtest' || network === 'regtest-ql'" class="network-badge">
            Regtest
        </div>
        <div v-else-if="network !== 'main'" class="network-badge">
            Unknown Network
        </div>

        <balance id="sidebar-balance" />
        <div id="sidebar-divider" />
        <main-menu id="main-menu" />
        <blockchain-status id="blockchain-status" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FiroLogoWhite from 'renderer/assets/FiroLogoWhite.vue';
import FiroLogoDark from 'renderer/assets/FiroLogoDark.vue';
import Balance from 'renderer/components/Sidebar/Balance'
import MainMenu from 'renderer/components/Sidebar/MainMenu'
import BlockchainStatus from 'renderer/components/Sidebar/BlockchainStatus'

export default {
    name: 'Sidebar',

    components: {
        Balance,
        MainMenu,
        BlockchainStatus,
        FiroLogoDark,
        FiroLogoWhite
    },

    computed: mapGetters({
        network: 'ApiStatus/network'
    })
}
</script>

<style lang="scss" scoped>
#sidebar {
    background: var(--color-background-sidebar);
    user-select: none;

    padding: {
        left: 12px;
        right: 12px;
    }

    #logo, .network-badge {
        width: fit-content;
        margin: {
            left: auto;
            right: auto;
        }
    }

    #logo {
        svg {
            height: 80px;
        }

        .logo-dark {
            display: block;

            @at-root #app.dark-color-theme & {
                display: none;
            }

            @media(prefers-color-scheme: dark) {
                @at-root #app:not(.light-color-theme) & {
                    display: none;
                }
            }
        }

        .logo-white {
            display: none;

            @at-root #app.dark-color-theme & {
                display: block;
            }

            @media(prefers-color-scheme: dark) {
                @at-root #app:not(.light-color-theme) & {
                    display: block;
                }
            }
        }
    }

    .network-badge {
        user-select: text;
        color: var(--color-primary);
        font-size: 0.8em;
    }

    #sidebar-balance, hr#sidebar-divider {
        margin: {
            top: 12px;
        }
    }

    #sidebar-divider {
        height: 1px;
        background: var(--color-text-subtle-border);
        margin: {
            top: 10px;
            bottom: 10px;
        }
    }

    #blockchain-status {
        user-select: text;
        position: absolute;
        left: 6px;
        bottom: 6px;
    }
}
</style>
