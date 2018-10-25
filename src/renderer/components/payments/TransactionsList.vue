<template>
    <ul class="transactions">
        <li v-for="(tx) in transactionsFormatted" :key="tx.id" :class="tx.className">
            <div class="icon">
                <tick-icon v-if="tx.isConfirmed" :color="tx.className"></tick-icon>
                <outgoing-icon v-else-if="tx.isOutgoing" />
                <incoming-icon v-else />
            </div>
            <div>
                <div class="label">
                    <!--<slot v-bind="value" />-->
                    <span class="amount">
                        <span class="name">{{ tx.amount }}</span>
                        <span class="unit">XZC</span>
                    </span>

                    <span class="timestamp">
                        <timeago :datetime="tx.firstSeenAt" :auto-update="30" />
                    </span>
                </div>

                <div class="wrapper">
                    <!--<span class="progress" :style="{ width: calcProcessInPercent(tx) + '%' }"></span>-->
                    <div class="progress" v-if="tx.isConfirmed"></div>
                    <!--
                    <div v-for="(confirmations, id) in tx" class="item" :key="id">

                    </div>
                    -->
                </div>
            </div>
        </li>
    </ul>
</template>

<script>
    import { convertToCoin } from '#/lib/convert'
    import TickIcon from '@/components/Icons/TickIcon'
    import IncomingIcon from '@/components/Icons/IncomingIcon'
    import OutgoingIcon from '@/components/Icons/OutgoingIcon'

    export default {
        name: 'TransactionsList',
        components: {
            OutgoingIcon,
            IncomingIcon,
            TickIcon
        },
        props: {
            transactions: {
                type: Array,
                required: true
            }
        },

        computed: {
            transactionsFormatted () {
                if (!this.transactions) {
                    return []
                }

                return this.transactions
                    .sort((a, b) => b.firstSeenAt - a.firstSeenAt)
                    .map((tx, index) => {
                        const { id, amount, firstSeenAt, confirmations, category } = tx
                        const order = this.transactions.length - index - 1

                        return {
                            id,
                            firstSeenAt,
                            amount: convertToCoin(amount),
                            order,
                            isConfirmed: confirmations > 1,
                            isOutgoing: category === 'send' || category === 'spendOut',
                            className: !order ? 'green' : 'warning' // order === index, 0 first received -> valid
                        }
                    })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .transactions {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
            margin-bottom: emRhythm(2.25, $silent: true);
            display: grid;
            grid-template-columns: emRhythm(3) auto;

            .icon {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
            }
            .label {
                display: flex;
                justify-content: space-between;

                .amount {
                    display: inline-block;

                    .name {
                        @include font-heavy();
                    }
                }

                .unit,
                .timestamp {
                    // @include font-medium();
                    @include lato-font('regular');
                    color: $color--comet;
                }

                .timestamp {
                    color: $color--comet;
                    font-style: italic;
                }

                /*.eta {
                    display: inline-block;
                    padding-left: emRhythm(1);
                    @include font-medium();
                    font-style: italic;
                    color: $color--comet;
                }*/
            }

            .wrapper {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                margin-top: emRhythm(1);
                background: $color--comet-light;
                height: emRhythm(0.75, $silent: true);

                .progress {
                    display: block;
                    background: $color--green;
                    transition: width 1s ease-out, background-color 1s ease-out;
                    min-width: emRhythm(0.5, $silent: true);
                    height: 100%;
                    width: 100%;
                }
            }

            &.green {
                .progress {
                    background: $color--green;
                }
            }

            &.warning {
                .progress {
                    background: $color--orange;
                }
            }
        }
    }
</style>
