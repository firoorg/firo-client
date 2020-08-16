<template>
    <div>
        <h3>{{ $t('navigation.flyout-connections.title') }}</h3>
        <ul v-if="connections">
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
                    <tick-icon color="white" /> <span v-html="$t('navigation.flyout-connections.label__dandelion')" />
                </span>
            </li>
            <li>
                <span v-if="connectedViaTor">
                    <tick-icon color="white" /> <span v-html="$t('navigation.flyout-connections.label__is-connected-via-tor')" />
                </span>
                <span v-else>
                    <cross-icon color="white" /> <span v-html="$t('navigation.flyout-connections.label__not-connected-via-tor')" />
                </span>
            </li>
        </ul>
        <p v-else>
            {{ $t('navigation.flyout-connections.description__not-connected') }}
        </p>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

import CircularBadge from 'renderer/components/Badge/CircularBadge'
import TickIcon from 'renderer/components/Icons/TickIcon'
import CrossIcon from 'renderer/components//Icons/CrossIcon'

export default {
    name: 'BlockchainConnectionPopover',
    components: {
        CircularBadge,
        TickIcon,
        CrossIcon
    },

    props: {
        connectionClass: {
            type: String,
            default: ''
        }
    },

    computed: {
        ...mapGetters({
            connections: 'Blockchain/connections',
            connectedViaTor: 'Settings/isConnectedViaTor'
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
