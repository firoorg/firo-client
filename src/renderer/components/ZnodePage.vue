<template>
    <section class="znode-page">
        <div
            v-scrollable
            class="scrollable-dark"
        >
            <div class="znode-page-inner">
                <section class="title-bar">
                    <header>
                        <h1>{{ $t('znodes.overview.title') }}</h1>
                        <p>{{ $t('znodes.overview.description') }}</p>
                    </header>

                    <div class="search-form">
                        <base-filter-input
                            v-model="urlFilter"
                            type="text"
                            class="table-filter-input"
                            :placeholder="$t('znodes.overview.table__znodes.placeholder__filter')"
                        />
                        <!--<div class="internal-only">
                            For Internal Use Only!!!
                        </div>-->
                    </div>
                </section>

                <znode-map
                    class="znodes-map"
                    :remote-znodes="remoteZnodes"
                    :my-znodes="myZnodes"
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
                    <!--<div
                        v-if="myZnodes.length"
                        class="stat"
                    >
                        <div class="value">
                            17.23
                        </div>
                        <div class="desc">
                            days until your next Payout
                        </div>
                    </div>-->
                </section>

                <section class="my-znodes">
                    <my-znode
                        v-for="(znode, index) in filteredMyZnodes"
                        :key="index"
                        v-bind="znode"
                    />
                </section>

                <section class="remote-znodes">
                    <remote-znodes-list :remote-znodes="filteredRemoteZnodes" />
                </section>
            </div>
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
// import types from '~/types'

import FilterByUrlParamMixin from '@/mixins/FilterByUrlParamMixin'

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

    mixins: [
        FilterByUrlParamMixin
    ],

    computed: {
        ...mapGetters({
            myZnodes: 'Znode/myZnodes',
            remoteZnodes: 'Znode/remoteZnodes',
            totalZnodes: 'Znode/totalZnodes',
            znodePaymentCycleInDays: 'Znode/znodePaymentCycleInDays'
        }),

        filteredMyZnodes () {
            return this.getFilteredByUrl(this.myZnodes, ['status', 'payeeAddress', 'authorityIp', 'id', 'label'])
        },

        filteredRemoteZnodes () {
            return this.getFilteredByUrl(this.remoteZnodes, ['status', 'payeeAddress', 'authorityIp', 'id'])
        },
    }
}
</script>

<style lang="scss" scoped>
    .znode-page {
        //display: grid;
        box-sizing: border-box;
        //grid-template-columns: 3fr  minmax(30rem, 2fr);
        background: $color--private;
        //padding-right: 6.25rem;

        & > div {
            height: 100%;
            //@include scrollbar-on-hover($color--comet-dark-mixed);
        }
    }

    .znode-page-inner {
        position: relative;
        background: $color--private;
        padding: emRhythm(5) emRhythm(4);
    }

    .title-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        box-sizing: border-box;

        display: flex;
        justify-content: space-between;
        padding: emRhythm(5) emRhythm(4);
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

        .search-form {
            position: fixed;
            right: emRhythm(4);
            width: 20rem;

            .table-filter-input {
                width: 100%;
            }
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
