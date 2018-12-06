<template>
    <section class="znode-page">
        <div class="scrollable-height">
            <div class="znode-page-inner">
                <section class="title-bar">
                    <header>
                        <h1>Znodes</h1>
                        <p>Integer posuere erat a ante venenatis dapibus velit aliquet. Etiam porta sem magna mollis euismod.</p>
                    </header>

                    <form>
                        <!--<input type="text" placeholder="Search for xxx">-->
                        <!--<div class="internal-only">
                            For Internal Use Only!!!
                        </div>-->
                    </form>
                </section>

                <znode-map
                    class="znodes-map"
                    :remote-znodes="remoteZnodes"
                    :my-znodes="myZnodes"
                    :znode-states="znodeStates"
                />

                <section class="stats">
                    <div class="stat">
                        <div class="value">
                            {{ totalZnodes }}
                        </div>
                        <div class="desc">
                            Total Nodes
                        </div>
                    </div>
                    <div class="stat">
                        <div class="value">
                            {{ znodePaymentCycleInDays.toFixed(2) }}
                        </div>
                        <div class="desc">
                            Avgerage Days for Payout
                        </div>
                    </div>
                    <div class="stat">
                        <div class="value">
                            17.23
                        </div>
                        <div class="desc">
                            days until your next Payout
                        </div>
                    </div>
                </section>

                <section class="my-znodes">
                    <my-znode
                        v-for="(znode, index) in myZnodes"
                        :key="index"
                        v-bind="znode"
                    />
                </section>

                <section class="remote-znodes">
                    <remote-znodes-list :remote-znodes="remoteZnodes" />
                </section>
            </div>
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
// import types from '~/types'

import MyZnode from '@/components/ZnodePage/MyZnode'
import ZnodeMap from '@/components/ZnodePage/ZnodeMap'
import RemoteZnodesList from '@/components/ZnodePage/RemoteZnodesList'

export default {
    name: 'ZnodePage',

    components: {
        RemoteZnodesList,
        MyZnode,
        ZnodeMap
    },

    data () {
        return {
            znodeStates: [
                {
                    name: 'valid',
                    states: [
                        'ENABLED'
                    ]
                },
                {
                    name: 'pending',
                    states: [
                        'PRE_ENABLED',
                        'MISSING'
                    ]
                },
                {
                    name: 'needs-attention',
                    states: [
                        'EXPIRED',
                        'OUTPOINT_SPENT',
                        'UPDATE_REQUIRED',
                        'WATCHDOG_EXPIRED',
                        'NEW_START_REQUIRED',
                        'POSE_BAN'
                    ]
                }
            ]
        }
    },

    computed: {
        ...mapGetters({
            myZnodes: 'Znode/myZnodes',
            remoteZnodes: 'Znode/remoteZnodes',
            totalZnodes: 'Znode/totalZnodes',
            znodePaymentCycleInDays: 'Znode/znodePaymentCycleInDays'
        })
    }
}
</script>

<style lang="scss" scoped>
    .znode-page {
        //display: grid;
        box-sizing: border-box;
        //grid-template-columns: 3fr  minmax(30rem, 2fr);
        background: $color--private;
        padding-right: 6.25rem;

        & > .scrollable-height {
            @include scrollbar-on-hover($color--comet-dark-mixed);
        }
    }

    .znode-page-inner {
        position: relative;
        background: $color--private;
        padding: emRhythm(5) emRhythm(3) emRhythm(5) emRhythm(4);
    }

    .title-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        box-sizing: border-box;

        display: flex;
        justify-content: space-between;
        padding: emRhythm(5) emRhythm(3) emRhythm(5) emRhythm(4);
        z-index: 10;

        header {
            display: flex;
            align-items: center;
            flex-direction: row;
            margin-bottom: emRhythm(7);

            h1 {
                margin-bottom: 0;
                color: $color--polo-light;
            }

            p {
                @include description(emRhythm(45));
                margin-left: emRhythm(4);
                color: $color--polo;
            }
        }

        form {

        }
    }

    .stats {
        position: relative;
        display: flex;
        justify-content: space-evenly;
        margin-top: emRhythm(-10);
        margin-bottom: emRhythm(7);
        z-index: 10;

        .stat {
            max-width: 15rem;

            .value {
                @include font-black();
                @include setType(4, $ms-up2);
                margin: 0;
                text-align: center;
                color: $color--polo-light;
            }

            .desc {
                @include font-medium();
                font-style: italic;
                color: $color--polo;
            }
        }
    }

    .my-znodes {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-column-gap: emRhythm(4);
        grid-row-gap: emRhythm(6);
    }

    .remote-znodes {
        margin-top: emRhythm(12);
        color: $color--white-light;

        .animated-table {
            /deep/ {
                thead th {
                    color: $color--dark;

                    &.sortable:hover .sort-icon {
                        color: $color--comet-medium;
                    }
                }
                .vuetable-body tr td {
                    border-color: $color--comet-dark-mixed;
                }
            }
        }

        & /deep/ .vuetable-td-authority {
            span {
                opacity: 0.5;
            }
        }
    }

    footer {
        margin-top: emRhythm(6);
        text-align: right;

        button + button {
            margin-left: emRhythm(2);
        }
    }
</style>
