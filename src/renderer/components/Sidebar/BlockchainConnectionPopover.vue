<template>
    <div>
        <h3>{{ $t('navigation.flyout-connections.title') }}</h3>
        <ul>
            <li>
                <i18n
                    path="navigation.flyout-connections.label__connections"
                    tag="span"
                >
                    <strong
                        class="connections-badge"
                        :class="connectionClass"
                    >
                        {{ connections }}
                    </strong>
                </i18n>
            </li>
            <li>
                <span>
                    <tick-icon color="white" /> <span v-html="$t('navigation.flyout-connections.label__is-connected-via-tor')" />
                </span>
            </li>
            <li>
                <span>
                    <tick-icon color="white" /> <span v-html="$t('navigation.flyout-connections.label__dandelion')" />
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

import TickIcon from '@/components/Icons/TickIcon'

export default {
    name: 'BlockchainConnectionPopover',
    components: {TickIcon},

    props: {
        connectionClass: {
            type: String,
            default: ''
        }
    },

    computed: {
        ...mapGetters({
            connections: 'Blockchain/connections'
        })
    }
}
</script>

<style lang="scss" scoped>
    h3 {
        margin-top: 0;
        margin-left: 2.5rem;
    }

    ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li {
        & > span {
            display: grid;
            grid-template-columns: 2rem auto;
            grid-column-gap: 0.5rem;
            justify-content: start;

            svg,
            .connections-badge {
                justify-self: center;
                align-self: center;
            }
        }

        strong {
            color: $color--white;
        }
    }

    li + li {
        padding-top: emRhythm(1);
    }

    .connections-badge {
        @include font-heavy();
        @include setType(2.5, $ms-down1, $silent: true);
        display: inline-block;
        border-radius: 50%;
        background: $color--white;
        text-align: center;
        min-width: emRhythm(2.5, $ms-down1, $silent: true);
        transition: color .25s ease-in-out, background .25s ease-in-out;

        &.error {
            color: $color--red;
        }

        &.public {
            color: $color--orange;
        }

        &.private {
            color: $color--green;
        }
    }
</style>
