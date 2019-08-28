<template>
    <div
        class="znode"
        :class="{ 'is-missing': isMissing }"
    >
        <div>
            <header class="heading">
                <h2>{{ znode.label }}</h2>
                <p v-if="znode.authority.ip">
                    {{ znode.authority.ip }}
                </p>
            </header>

            <template v-if="isMissing">
                <div>
                    <p v-html="$t('znodes.my-znode.description__status-missing')" />
                </div>
            </template>
            <template v-else>
                <div class="znode-stats">
                    <section class="status">
                        <header>{{ $t('znodes.my-znode.label__status') }}</header>
                        <main>
                            <znode-status :status="znode.status" />
                        </main>
                    </section>
                    <section class="last-seen">
                        <header>{{ $t('znodes.my-znode.label__last-seen') }}</header>
                        <main>
                            <timeago
                                :datetime="znode.lastSeen"
                                :auto-update="30"
                            />
                        </main>
                    </section>
                    <section class="active-since">
                        <header>{{ $t('znodes.my-znode.label__active-since') }}</header>
                        <main>
                            <timeago
                                :datetime="znode.activeSince"
                                :auto-update="30"
                            />
                        </main>
                    </section>
                    <template v-if="belongsToWallet">
                        <section class="next-payout">
                            <header>{{ $t('znodes.my-znode.label__next-payout') }}</header>
                            <main>
                                <template v-if="nextEstimatedPayout < Date.now()">
                                    {{ $t('znodes.my-znode.description__next-payout--soon') }}
                                </template>
                                <template v-else>
                                    <timeago
                                        v-if="znode.lastPaidTime"
                                        :datetime="nextEstimatedPayout"
                                        :auto-update="30"
                                    />
                                </template>
                            </main>
                        </section>

                        <section class="last-payout">
                            <header>{{ $t('znodes.my-znode.label__last-payout') }}</header>
                            <main>
                                <timeago
                                    v-if="znode.lastPaidTime"
                                    :datetime="znode.lastPaidTime"
                                    :auto-update="30"
                                />
                                <span v-else>
                                    {{ $t('znodes.my-znode.description__last-payout--nothing-received') }}
                                </span>
                            </main>
                        </section>
                        <section class="received">
                            <header>{{ $t('znodes.my-znode.label__amount-received') }}</header>
                            <main>
                                {{ convertToCoin(payoutsReceived) }} XZC
                            </main>
                        </section>
                        <section class="payee">
                            <header>{{ $t('znodes.my-znode.label__payee') }}</header>
                            <main>{{ znode.payeeAddress }}</main>
                        </section>
                    </template>
                    <template v-else>
                        <notice class="does-not-belong">
                            {{ $t('znodes.my-znode.description__does-not-belong-to-wallet') }}
                        </notice>
                    </template>
                </div>
            </template>
        </div>

        <footer v-if="!isMissing">
            <template v-if="belongsToWallet">
                <base-button
                    size="small"
                    :is-outline="!isEnabled"
                    :color="isEnabled ? 'comet' : ''"
                    @click.prevent="openBlockExplorer"
                >
                    {{ $t('znodes.my-znode.button__open-explorer') }}
                </base-button>
            </template>
            <template v-else>
                <base-button
                    size="small"
                    color="comet"
                    @click.prevent="openBlockExplorer"
                >
                    {{ $t('znodes.my-znode.button__open-explorer') }}
                </base-button>
            </template>
        </footer>
    </div>
</template>

<script>
import { shell } from 'electron'
import { mapGetters } from 'vuex'
import { convertToCoin } from '#/lib/convert'
import Notice from '@/components/Notification/Notice'
import ZnodeStatus from '@/components/ZnodePage/ZnodeStatus'

export default {
    name: 'MyZnode',

    components: {
        ZnodeStatus,
        Notice
    },

    props: {
        znode: {
            type: Object,
            required: true
        }
    },

    computed: {
        ...mapGetters({
            getExplorerAddressUrl: 'Settings/getExplorerAddressUrl',
            getAmountReceivedViaAddress: 'Transactions/getAmountReceivedViaAddress',
            addresses: 'Transactions/addresses',
            paymentPeriod: 'Znode/paymentPeriod'
        }),

        isMissing () {
            return this.status === 'MISSING'
        },

        isEnabled () {
            return this.status === 'ENABLED'
        },

        payoutsReceived () {
            return this.getAmountReceivedViaAddress(this.znode.payeeAddress) - 1e11;
        },

        belongsToWallet () {
            return !!this.addresses[this.znode.payeeAddress];
        },

        nextEstimatedPayout () {
            const t = this.znode.lastPaidTime || this.znode.activeSince || Date.now();
            return (t + this.paymentPeriod - Date.now()) / 1000 / 24 / 60 / 60;
        }
    },

    methods: {
        convertToCoin,

        openBlockExplorer () {
            shell.openExternal(this.getExplorerAddressUrl(this.znode.payeeAddress))
        }
    }
}
</script>

<style lang="scss" scoped>
    .znode {
        background: $color--polo-light;
        @include box-shadow-large();
        @include glow-small-box();
        padding: emRhythm(5) emRhythm(4);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: background 0.25s ease-in-out;

        &.is-missing {
            background: rgba($color--polo-light, 0.75);
        }

        .heading {
            padding-bottom: emRhythm(4);

            h2 {
                padding-top: 0;
                margin: 0;
            }

            p {
                margin: emRhythm(1) 0 0;
                @include font-medium();
                font-style: italic;
                color: $color--comet;
            }
        }

        .znode-stats {
            display: grid;
            grid-template-areas: "status last-seen active-since"
                                 "next-payout last-payout received"
                                 "payee payee payee";
            grid-template-columns: 33%;
            grid-column-gap: emRhythm(1);
            grid-row-gap: emRhythm(1);

            header {
                @include font-medium();
                font-style: italic;
                color: $color--comet;
            }

            .status { grid-area: status; }
            .last-seen { grid-area: last-seen; }
            .active-since { grid-area: active-since; }
            .next-payout { grid-area: next-payout; }
            .last-payout { grid-area: last-payout; }
            .received { grid-area: received; }
            .payee, .does-not-belong { grid-area: payee; }
        }

        footer {
            margin-top: emRhythm(5);
            text-align: right;
        }
    }
</style>
