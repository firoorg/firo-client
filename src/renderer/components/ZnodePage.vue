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
                </section>

                <section class="stats">
                    <div class="stat">
                        <div class="value">
                            {{ enabledZnodeCount }}/{{ totalZnodeCount }}
                        </div>
                        <div class="desc">
                            Enabled/Total Znodes
                        </div>
                    </div>
                    <template v-if="!statsLoaded">
                        <div class="stat loading">
                            <div class="loading-wrap">
                                <loading-bounce color="dark" />
                            </div>
                            <div>
                                <div class="value">
                                    {{ $t('znodes.overview.stats.label__znodelist-syncing') }}
                                </div>
                                <div class="desc">
                                    {{ $t('znodes.overview.stats.description__znodelist-syncing') }}
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="stat">
                            <div class="value">
                                {{ paymentPeriodInDays }}
                            </div>
                            <div class="desc">
                                {{ $t('znodes.overview.stats.description__average-days-for-payout') }}
                            </div>
                        </div>
                        <div
                            v-if="enabledMyZnodes.length && daysUntilNextPayout > 0"
                            class="stat"
                        >
                            <div class="value">
                                {{ daysUntilNextPayout }}
                            </div>
                            <div class="desc">
                                {{ $t('znodes.overview.stats.description__days-until-next-payout') }}
                            </div>
                        </div>
                    </template>
                </section>

                <section class="my-znodes">
                    <my-znode
                        v-for="(znode, index) in sortedMyZnodes"
                        :key="index"
                        :znode="znode"
                    />
                </section>
            </div>
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'

import MyZnode from 'renderer/components/ZnodePage/MyZnode'
import LoadingBounce from "./Icons/LoadingBounce";

export default {
    name: 'ZnodePage',

    components: {
        LoadingBounce,
        MyZnode
    },

    computed: {
        ...mapGetters({
            isWinnersListSynced: 'Blockchain/isWinnersListSynced',
            myZnodes: 'Znode/myZnodes',
            totalZnodeCount: 'ApiStatus/totalZnodeCount',
            enabledZnodeCount: 'ApiStatus/enabledZnodeCount',
            paymentPeriod: 'Znode/paymentPeriod'
        }),

        sortedMyZnodes () {
            return [...this.myZnodes].sort((x, y) => x.position - y.position);
        },

        enabledMyZnodes () {
            return this.myZnodes.filter(znode => znode.status === 'ENABLED')
        },

        paymentPeriodInDays () {
            return (this.paymentPeriod / 1000 / 24 / 60 / 60).toFixed(1);
        },

        daysUntilNextPayout () {
            const oldestUnpaidTime = this.myZnodes
                .map(znode => znode.lastPaidTime || znode.activeSince )
                .sort() // false is sorted last
                [0];

            if (!oldestUnpaidTime) {
                return false
            }

            const estimatedNextPayout = oldestUnpaidTime + this.paymentPeriod;

            return (estimatedNextPayout - Date.now()) / 1000 / 24 / 60 / 60;
        },

        statsLoaded () {
            return this.isWinnersListSynced
        }
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
        z-index: 20;

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
        z-index: 10;

        margin-top: emRhythm(12);

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

            &.loading {
                display: flex;
                align-items: center;
                max-width: 25rem;

                .loading-wrap {
                    margin-right: emRhythm(2);
                }

                .value {
                    text-align: left;
                }
            }
        }
    }

    .my-znodes {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-column-gap: emRhythm(4);
        grid-row-gap: emRhythm(6);
        padding-top: 2em;
    }

    .remote-znodes {
        margin-top: emRhythm(12);
        color: $color--white-light;

        .animated-table {
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

        & .vuetable-td-authority {
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
