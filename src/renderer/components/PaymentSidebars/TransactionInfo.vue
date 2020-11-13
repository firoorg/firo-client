<template>
    <section class="tx-info">
        <div class="top-section">
            <h1>
                {{ title }}
            </h1>
        </div>

        <div class="details">
            <div class="amount">
                <span :class="`${isIncoming ? 'incoming' : 'outgoing'}-amount`">
                    {{ isIncoming ? '+' : '-' }}
                    {{ convertToCoin(tx.amount) }}
                </span>

                FIRO
            </div>

            <div
                v-if="!confirmations"
                class="unconfirmed-warning"
            >
                This transaction is unconfirmed. Unconfirmed transactions can still be reversed, and should not be
                considered final.
            </div>

            <div
                v-else
                class="confirmations"
            >
                This transaction has {{ confirmations }} confirmation{{ confirmations > 1 ? 's' : '' }}
            </div>

            <div class="address">
                <h2>Address:</h2>

                <div class="value">
                    {{ tx.address }}
                </div>
            </div>

            <div class="txid">
                <h2>Transaction ID:</h2>

                <div class="value">
                    {{ tx.txid }}
                </div>
            </div>

            <div class="block-explorer">
                <a @click.prevent="openExplorer" href="#">
                    View Transaction in Block Explorer
                </a>
            </div>
        </div>

        <div
            v-if="isPrivate"
            class="privacy-message"
        >
            This transaction is protected with Firo's Sigma technology. No one can see who sent it.
        </div>
    </section>
</template>

<script>
import { shell } from 'electron';
import { mapGetters } from 'vuex';
import { convertToCoin } from "lib/convert";

export default {
    name: "TransactionInfo",

    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            currentBlockHeight: 'Blockchain/currentBlockHeight',
            getExplorerTransactionUrl: 'Settings/getExplorerTransactionUrl'
        }),

        uniqId () {
            return this.$route.params.uniqId;
        },

        tx () {
            return this.transactions[this.uniqId] || throw `unknown txid '${this.uniqId}'`;
        },

        confirmations () {
            return this.tx.blockHeight ? this.currentBlockHeight - this.tx.blockHeight + 1 : 0;
        },

        title () {
            if (this.tx.label) {
                return this.tx.label;
            }

            switch (this.tx.category) {
            case 'spendIn':
            case 'receive':
                return 'Incoming Transaction';

            case 'spendOut':
            case 'send':
                return 'Outgoing Transaction';

            case 'mined':
                return 'Mining Transaction';

            case 'znode':
                return 'Znode Payment';

            default:
                return `${this.tx.category} Transaction`;
            }
        },

        isIncoming () {
            return ['spendIn', 'receive', 'mined', 'znode'].includes(this.tx.category);
        },

        isPrivate () {
            return ['spendIn', 'spendOut'].includes(this.tx.category);
        }
    },

    methods: {
        convertToCoin,

        openExplorer () {
            shell.openExternal(this.getExplorerTransactionUrl(this.tx.txid));
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";
@import "src/renderer/styles/sizes";


.tx-info {
    height: 100vh;
    background: $color-detail-background;

    padding: {
        left: 2em;
        right: 2em;
    }

    .unconfirmed-warning {
        padding-top: $size-small-space;
        @include small();
        font-style: italic;
        text-align: center;
    }

    h2 {
        margin-bottom: $size-tiny-space;
    }

    .details {
        .amount {
            @include large();
            text-align: right;
            margin-bottom: $size-tiny-space;

            .incoming-amount {
                color: $color-amount-positive;
            }

            .outgoing-amount {
                color: $color-amount-negative;
            }
        }

        .address {
            margin-top: $size-large-space;
        }

        .confirmations {
            @include small();
            text-align: right;
            font-style: italic;
        }

        .txid {
            margin: {
                top: $size-small-space;
                bottom: $size-tiny-space;
            }

            .value {
                @include monospace();
                @include mini();
            }
        }

        .block-explorer {
            @include small();
        }
    }

    .privacy-message {
        text-align: center;
        font-style: italic;
    }
}
</style>
