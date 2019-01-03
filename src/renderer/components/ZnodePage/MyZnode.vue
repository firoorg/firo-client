<template>
    <div class="znode">
        <div>
            <header>
                <h2>{{ label }}</h2>
            </header>

            <div class="znode-stats">
                <section class="status">
                    <header>{{ $t('znodes.my-znode.label__status') }}</header>
                    <main>{{ status }}</main>
                </section>
                <section class="last-seen">
                    <header>{{ $t('znodes.my-znode.label__last-seen') }}</header>
                    <main>
                        <timeago
                            :datetime="lastSeen"
                            :auto-update="30"
                        />
                    </main>
                </section>
                <section class="active-since">
                    <header>{{ $t('znodes.my-znode.label__active-since') }}</header>
                    <main>
                        <timeago
                            :datetime="activeSince"
                            :auto-update="30"
                        />
                    </main>
                </section>
                <section class="next-payout">
                    <header>{{ $t('znodes.my-znode.label__next-payout') }}</header>
                    <main>
                        <timeago
                            v-if="lastPaidTime"
                            :datetime="nextEstPayout"
                            :auto-update="30"
                        />
                    </main>
                </section>
                <section class="last-payout">
                    <header>{{ $t('znodes.my-znode.label__last-payout') }}</header>
                    <main>
                        <timeago
                            v-if="lastPaidTime"
                            :datetime="lastPaidTime"
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
                        {{ payoutsReceived }}
                    </main>
                </section>
                <section class="payee">
                    <header>{{ $t('znodes.my-znode.label__payee') }}</header>
                    <main>{{ payeeAddress }}</main>
                </section>
            </div>
        </div>

        <footer>
            <base-button :is-outline="true">
                Other
            </base-button>
            <base-button color="comet">
                Action Name
            </base-button>
        </footer>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { convertToCoin } from '#/lib/convert'

export default {
    name: 'MyZnode',

    props: {
        label: {
            type: String,
            required: true
        },
        payeeAddress: {
            type: String,
            required: true
        },
        lastSeen: {
            type: Number,
            default: -1
        },
        activeSince: {
            type: Number,
            default: -1
        },
        status: {
            type: String,
            default: 'MISSING'
        },
        lastPaidTime: {
            type: Number,
            default: 0
        }
    },

    computed: {
        ...mapGetters({
            znodePaymentCycleInDays: 'Znode/znodePaymentCycleInDays'
        }),

        payoutsReceived () {
            const received = this.$store.getters['Address/getAmountReceivedViaAddress'](this.payeeAddress)

            if (received === -1) {
                return `It seems that the masternode collateral is not an address of this wallet.`
            }

            return `${convertToCoin(received)} XZC`
        },

        nextEstPayout () {
            const znodePaymentCycleInMs = Math.ceil(this.znodePaymentCycleInDays * 24 * 60 * 60 * 1000)
            const now = Date.now()

            if (this.lastPaidTime) {
                return this.lastPaidTime + znodePaymentCycleInMs
            }

            // todo discuss with @Sebastion
            return this.activeSince + znodePaymentCycleInMs
        }
    }
}
</script>

<style lang="scss" scoped>
    .znode {
        background: $color--polo-light;
        @include box-shadow-large();
        //@include glow-huge-box();
        @include glow-small-box();
        padding: emRhythm(5) emRhythm(3) emRhythm(5) emRhythm(4);
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .znode-stats {
            display: grid;
            grid-template-areas: "status last-seen active-since"
            "next-payout last-payout received"
            "payee payee payee";
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
            .payee { grid-area: payee; }
        }

        footer {
            margin-top: emRhythm(5);
        }
    }
</style>
