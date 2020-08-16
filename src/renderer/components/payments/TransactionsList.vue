<template>
    <ul class="transactions">
        <li
            v-for="(tx) in transactionsFormatted"
            :key="tx.id"
            :class="tx.className"
        >
            <div class="icon">
                <tick-icon
                    v-if="tx.isConfirmed"
                    :color="tx.className"
                />
                <outgoing-icon v-else-if="tx.isOutgoing" />
                <incoming-icon v-else />
            </div>
            <div>
                <div class="label">
                    <!--<slot v-bind="value" />-->
                    <span class="amount">
                        <span class="name">
                            {{ tx.amount }}
                        </span>
                        <span class="unit">
                            XZC
                        </span>
                    </span>

                    <span class="timestamp">
                        <timeago
                            :datetime="tx.firstSeenAt"
                            :auto-update="30"
                        />
                    </span>
                </div>

                <div
                    class="txid"
                    :class="{confirmed: tx.confirmations}"
                >
                    {{ tx.txid }}
                </div>
            </div>
        </li>
    </ul>
</template>

<script>
import { convertToCoin } from 'lib/convert'
import TickIcon from 'renderer/components/Icons/TickIcon'
import IncomingIcon from 'renderer/components/Icons/IncomingIcon'
import OutgoingIcon from 'renderer/components/Icons/OutgoingIcon'

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

            return [...this.transactions]
                .sort((a, b) => b.firstSeenAt - a.firstSeenAt)
                .map((tx, index) => {
                    const { txid, amount, firstSeenAt, confirmations, isConfirmed, category } = tx
                    const order = this.transactions.length - index - 1
                    const isGreen = !order || ['spendIn', 'spendOut', 'mined'].includes(category)

                    return {
                        txid,
                        firstSeenAt,
                        amount: convertToCoin(amount),
                        order,
                        confirmations,
                        isConfirmed,
                        isOutgoing: category === 'send' || category === 'spendOut',
                        className: isGreen ? 'green' : 'warning' // order === index, 0 first received -> valid
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
                    @include font-regular();
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

            .txid {
                font-size: 0.6em;
                font-weight: bold;


                &.confirmed {
                    color: green;
                }

                &:not(.confirmed) {
                    color: gray;
                }
            }
        }
    }
</style>
