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
    user-select: none;

    #logo, .network-badge {
        width: fit-content;
        margin: {
            left: auto;
            right: auto;
        }
    }

    #logo {
        margin-top: $size-menu-top-margin;

        svg {
            height: $size-menu-logo;
        }
    }

    .network-badge {
        @include monospace();
        user-select: text;
        color: $color-text-accent;
        font-size: 0.8em;
    }

    #sidebar-balance {
        user-select: text;
    }

    #main-menu {
        margin-top: 1em;
    }

    #blockchain-status {
        user-select: text;
        position: absolute;
        bottom: 0;
    }
}
</style>
