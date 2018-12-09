<template>
    <div>
        <h3>{{ $t('navigation.flyout-connections.title') }}</h3>
        <ul>
            <li>
                <i18n
                    path="navigation.flyout-connections.label__connections"
                    tag="span"
                >
                    <circular-badge
                        class="connections-badge"
                        :color="connectionClass"
                        :content="connections"
                    />
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

import CircularBadge from '@/components/Badge/CircularBadge'
import TickIcon from '@/components/Icons/TickIcon'

export default {
    name: 'BlockchainConnectionPopover',
    components: {
        CircularBadge,
        TickIcon
    },

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
        background: $color--white !important;

        &.error {
            color: $color--red-bright;
        }

        &.public {
            color: $color--orange;
        }

        &.private {
            color: $color--green;
        }
    }
</style>
