<template>
    <nav class="main-menu">
        <router-link to="/send">
            Send
        </router-link>

        <router-link to="/receive">
            Receive
        </router-link>

        <router-link to="/transactions">
            Transactions
        </router-link>

        <router-link v-if="enableElysium" to="/elysium">
            Elysium
        </router-link>

        <router-link v-if="network === 'main'" to="/coinswap">
            Coin Swap
        </router-link>

        <router-link to="/znodes">
            Masternodes
        </router-link>

        <router-link to="/settings">
            Settings
        </router-link>

        <router-link to="/debugconsole">
            Debug Console
        </router-link>
    </nav>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
    name: 'MainMenu',

    computed: mapGetters({
        network: 'ApiStatus/network',
        enableElysium: 'App/enableElysium'
    })
}
</script>

<style lang="scss" scoped>
nav {
    a {
        display: block;

        color: var(--color-text-primary);
        font-weight: bold;
        text-decoration: none;

        padding: 8px;
        border-radius: 4px;

        &:hover {
            background-color: var(--color-primary-button-hover);
        }

        &:active {
            background-color: var(--color-primary-button-pressed);
            color: var(--color-primary-contrast);
        }

        &.router-link-active {
            background-color: var(--color-primary-background);
            color: var(--color-primary-contrast);
        }
    }
}
</style>
