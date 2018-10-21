<template>
    <section class="blockchain">
        <div class="status" :class="{ 'is-synced': getIsSynced }">
            <template v-if="getIsSynced">
                <tick-icon class="icon"></tick-icon>
                <span>Synced</span>
            </template>
            <template v-else>
                <loading-bounce class="icon" color="green" size="mini"></loading-bounce>
                <span>Syncing...</span>
            </template>
        </div>
        <div class="connections" :class="connectionClass">
            <base-popover trigger="hover"
                          boundaries-element="body"
                          :popover-class="['advice', connectionPopoverClass]"
                          placement="bottom-end"
                          :offset="4"
                          :delay="{ show: 200, hide: 100 }">
                <blockchain-connection-popover slot="content" />
                <template slot="target">
                    <span class="connections-badge">{{ connections }}</span>
                </template>
            </base-popover>
        </div>
        <div class="sync-progress" :class="{ 'is-synced': getIsSynced }">
            <div class="wrap" v-show="!isBlockchainSynced">
                <div class="loaded" :style="{ width: `${progress}%`}"></div>
            </div>
            <!--
            <div class="wrap">
                <div class="loaded" :style="{ width: `${1.5 * progress}%`}"></div>
            </div>
            -->
        </div>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'

    import LoadingBounce from '@/components/Icons/LoadingBounce'
    import TickIcon from '@/components/Icons/TickIcon'

    import BlockchainConnectionPopover from '@/components/Sidebar/BlockchainConnectionPopover'

    export default {
        name: 'Blockchain',
        components: {
            LoadingBounce,
            TickIcon,
            BlockchainConnectionPopover
        },

        computed: {
            ...mapGetters({
                currentBlockHeight: 'Blockchain/currentBlockHeight',
                currentBlockTimestamp: 'Blockchain/currentBlockTimestamp',
                avgBlockTime: 'Blockchain/averageBlockTimeInMilliSeconds',
                isSynced: 'Blockchain/isSynced',
                isBlockchainSynced: 'Blockchain/isBlockchainSynced',
                isZnodeListSynced: 'Blockchain/isZnodeListSynced',
                hasConnections: 'Blockchain/hasConnections',
                connections: 'Blockchain/connections'
            }),

            getIsSynced () {
                // todo check if wallet has znode
                return this.isBlockchainSynced // ? this.isBlockchainSynced : this.isSynced
            },

            progress () {
                const now = Date.now()
                const remainingTime = now - (this.currentBlockTimestamp * 1000)
                const remainingBlocks = remainingTime / this.avgBlockTime

                console.log({ remainingTime, remainingBlocks })
                const estimatedTipHeight = this.currentBlockHeight + remainingBlocks
                return this.currentBlockHeight / estimatedTipHeight * 100
            },

            connectionPopoverClass () {
                if (!this.hasConnections) {
                    return 'error'
                }

                return 'green'
            },

            connectionClass () {
                if (!this.hasConnections) {
                    return 'error'
                }

                // todo implement check if tor and dandelion are activated
                // return 'public'

                return 'private'
            }
        }
    }
</script>

<style lang="scss">
    $loaded-background: $color--green;
    section.blockchain {
        position: relative;
        display: grid !important;
        grid-template-areas: "status connections"
        "sync sync";
        grid-template-rows: 1fr auto;
        grid-row-gap: emRhythm(1);
        /*
        display: flex !important;
        flex-direction: row;
        align-items: flex-end;
        */

        .status {
            grid-area: status;
            justify-self: start;
            align-self: end;
            margin-left: emRhythm(3);

            color: $color--comet;
            font-style: italic;
            // border: 1px solid red;
            display: flex;
            align-items: baseline;

            .icon {
                transform: translate(0px, 20%);
            }

            span {
                //@include setType(2);
                //padding: 0.25em 0 0.5rem;
                display: inline-block;
            }

            .icon + span {
                margin-left: emRhythm(0.75, $silent: true);
            }
        }

        .connections {
            grid-area: connections;
            justify-self: end;
            align-self: end;
            margin-right: emRhythm(3);

            &.error .connections-badge {
                background: $gradient--red-vertical;
                color: $color--white;
            }

            &.public .connections-badge {
                background: $gradient--orange-vertical;
                color: $color--dark;
            }

            &.private .connections-badge {
                background: $gradient--green-bright;
                color: $color--dark;
            }

            .connections-badge {
                @include font-heavy();
                @include setType(2.5, $ms-down1, $silent: true);
                display: inline-block;
                border-radius: 50%;
                background: $color--comet-dark;
                min-width: emRhythm(2.5, $ms-down1, $silent: true);
                transition: color .25s ease-in-out, background .25s ease-in-out;
                cursor: help;
            }
        }

        .sync-progress {
            grid-area: sync;
            background: $color--comet-dark;
            height: emRhythm(1);
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: height 0.5s ease-in-out, background 0.5s ease-in-out;

            &.is-synced {
                height: emRhythm(0.25, $silent: true);
                background: $loaded-background;

                .loaded {
                    background: $color--green;
                }
            }

            .wrap {
                flex-grow: 1;
                width: 100%;
                display: flex;
            }

            .loaded {
                background: $gradient--green-bright;
                transition: width 1s ease-in-out;
            }
        }
    }
</style>
