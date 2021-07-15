<template>
    <div id="sidebar">
        <div id="logo">
            <router-link to="/main">
                <FiroLogoDark />
            </router-link>
        </div>

        <div v-if="network === 'test'" class="network-badge">
            Testnet
        </div>
        <div v-else-if="network === 'regtest'" class="network-badge">
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
import FiroLogoDark from 'renderer/assets/FiroLogoDark.svg';
import Balance from 'renderer/components/Sidebar/Balance'
import MainMenu from 'renderer/components/Sidebar/MainMenu'
import BlockchainStatus from 'renderer/components/Sidebar/BlockchainStatus'

export default {
    name: 'Sidebar',

    components: {
        FiroLogoDark,
        Balance,
        MainMenu,
        BlockchainStatus
    },

    computed: mapGetters({
        network: 'ApiStatus/network'
    })
}
</script>

<style lang="scss" scoped>
@import 'src/renderer/styles/colors';
@import 'src/renderer/styles/sizes';

#sidebar {
    background: var(--color-background-sidebar);
    user-select: none;

    padding: {
        left: $size-small-space;
        right: $size-small-space;
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
            height: $size-menu-logo;
        }
    }

    .network-badge {
        @include monospace();
        user-select: text;
        color: var(--color-primary);
        font-size: 0.8em;
    }

    #sidebar-balance, hr#sidebar-divider {
        margin: {
            top: $size-small-space;
        }
    }

    #sidebar-divider {
        height: 1px;
        background: var(--color-text-subtle-border);
        margin: {
            top: 10px;
            bottom: 20px;
        }
    }

    #main-menu {
        margin-top: 1em;
    }

    #blockchain-status {
        user-select: text;
        position: absolute;
        left: $size-tiny-space;
        bottom: $size-tiny-space;
    }
}
</style>
