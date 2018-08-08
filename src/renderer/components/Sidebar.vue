<template>
    <aside class="sidebar scrollable-height">
        <div class="logo">
            <router-link :to="{ name: 'home' }">
                <zcoin-logo-text />
            </router-link>
        </div>

        <Balance class="balance"></Balance>
        <main-menu class="menu"></main-menu>

        <settings class="settings"></settings>
        <!--<Blockchain class="blockchain"></Blockchain>-->
    </aside>
</template>

<script>
    import ZcoinLogoText from '@/components/Icons/ZcoinLogoText'
    import Balance from '@/components/Sidebar/Balance'
    import Menu from '@/components/Sidebar/Menu'
    import Settings from '@/components/Sidebar/Settings'
    // import Blockchain from '@/components/Sidebar/Blockchain'

    export default {
        name: 'sidebar',
        components: {
            ZcoinLogoText,
            Balance,
            'main-menu': Menu,
            Settings
            // Blockchain
        }
    }
</script>

<style lang="scss" scoped>
    .sidebar {
        //background-image: $gradient--comet-dark-horizontal;
        background-image: linear-gradient(to top right, $color--dark, $color--comet-dark-mixed);

        display: grid;
        grid-row-gap: emRhythm(2);
        grid-template-areas: "logo" "balance" "menu" "settings" "blockchain";
        $logo-height: $sidebar--logo-margin-top + $sidebar--logo-height + $sidebar--logo-margin-bottom;
        grid-template-rows: emRhythm($logo-height) 5rem auto 2fr 5rem;
        color: #fff;

        -webkit-user-select: none;
        -webkit-app-region: drag;
    }

    .logo {
        grid-area: logo;

        margin: emRhythm($sidebar--logo-margin-top) 0 emRhythm($sidebar--logo-margin-bottom);
        height: emRhythm($sidebar--logo-height);

        a {
            display: block;
            height: 100%;
        }

        svg {
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
        grid-area: blockchain;
    }
</style>