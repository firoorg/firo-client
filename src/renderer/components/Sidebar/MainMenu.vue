<template>
    <nav class="main-menu">
        <router-link to="/send">
            <div class="inner">
                Send
            </div>
        </router-link>

        <router-link to="/receive">
            <div class="inner">
                Receive
            </div>
        </router-link>

        <router-link to="/transactions">
            <div class="inner">
                Transactions
            </div>
        </router-link>

        <router-link v-if="network === 'main'" to="/coinswap">
            <div class="inner">
                Coin Swap
            </div>
        </router-link>

        <router-link to="/znodes">
            <div class="inner">
                Masternodes
            </div>
        </router-link>

        <router-link to="/settings">
            <div class="inner">
                Settings
            </div>
        </router-link>

        <router-link to="/debugconsole">
            <div class="inner">
                Debug Console
            </div>
        </router-link>
    </nav>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
    name: 'MainMenu',

    computed: mapGetters({
        network: 'ApiStatus/network'
    })
}
</script>

<style lang="scss" scoped>
@mixin highlight-styles() {
    border-radius: 4px;
    color: white;
    background-color: var(--color-primary-background);
}

nav {
    a {
        display: block;

        color: var(--color-text-primary);
        font-weight: bold;
        text-decoration: none;

        padding: 8px;

        &:hover {
            @include highlight-styles();
        }
    }

    a.router-link-active {
        @include highlight-styles();
    }
}
</style>
