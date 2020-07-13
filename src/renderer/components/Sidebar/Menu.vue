<template>
    <nav class="menu">
        <ul>
            <li>
                <router-link to="/receive">
                    <span class="text">
                        {{ $t('navigation.menu.button__receive') }}
                    </span>
                </router-link>
            </li>
            <li class="has-divider">
                <router-link to="/anonymize">
                    <percentage-to-hold-in-zerocoin-notification>
                        <span class="text">
                            {{ $t('navigation.menu.button__mint') }}
                        </span>
                    </percentage-to-hold-in-zerocoin-notification>
                </router-link>
            </li>
            <li>
                <router-link to="/send/public">
                    <span class="text">
                        Public Send
                    </span>
                </router-link>
            </li>
            <li>
                <router-link to="/send/private">
                    <span class="text">
                        Private Send
                    </span>
                </router-link>
            </li>
            <li>
                <router-link to="/addressbook">
                    <span class="text">
                        Address Book
                    </span>
                </router-link>
            </li>
            <li class ="has-divider">
                <router-link to="/znodes">
                    <span class="text">
                        Znodes
                    </span>
                </router-link>
            </li>
            <li>
                <router-link to="/znodelist">
                    <span class="text">
                        Legacy {{ $t('navigation.menu.button__znode') }}
                    </span>
                </router-link>
            </li>
            <li class="has-divider">
                <router-link to="/settings">
                    <span class="text">
                        {{ $t('navigation.menu.button__settings') }}
                    </span>
                </router-link>
            </li>
            <li>
                <router-link to="/debugconsole">
                    <span class="text">
                        Debug Console
                    </span>
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<script>
import {mapGetters} from "vuex";
import PercentageToHoldInZerocoinNotification from '@/components/Notification/PercentageToHoldInZerocoinNotification'

export default {
    name: 'Menu',

    components: {
        PercentageToHoldInZerocoinNotification
    },

    computed: {
        ...mapGetters({
            localZnodeCount: 'ApiStatus/localZnodeCount'
        })
    }
}
</script>

<style lang="scss" scoped>
    $bleed: 2;
    $bleed-active: 3;
    $padding: 3;

    .menu {
        //margin-top: emRhythm(0.41);
        //@include sassline(zeta, $bodytype, 2, 2, all);
        border: none;
        text-align: left;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    li {
        padding-left: emRhythm(max(4, $bleed-active + $padding));
        padding-right: emRhythm(max(4, $bleed-active + $padding));

        &.has-divider {
            border: 0px solid $color--comet-dark;
            @include rhythmBorderTop(1px, 2);
            margin-top: emRhythm(2);
        }
    }

    a {
        display: block;
        position: relative;
        //border: 1px solid red;
        @include setType(5);
        margin: 0 0 emRhythm(1);
        border-radius: 0.25rem;
        color: $color--white-light;
        text-decoration: none;
        @include bleed-h($bleed);
        transition: padding .1s ease-in-out, margin .1s ease-in-out;

        &:after {
            position: absolute;
            content: '';
            display: block;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            background: $gradient--polo-vertical;
            opacity: 0;
            transition: opacity 0.15s ease-out;

        }

        .text {
            position: relative;
            z-index: 2;
        }

        &:hover,
        &:focus {
            &:after {
                opacity: .15;
            }
        }

        &.router-link-active {
            @include bleed-h($bleed-active);
            //padding-left: emRhythm(2);
            &:after {
                opacity: .3;
            }
        }

        .popover {
            width: 100%;
        }
    }

    a,
    a .trigger {
        display: flex !important;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
</style>
