<template>
    <section v-if="!isNaN(blockHeight)" class="mint-info">
        <div class="title">
            Private Mint
        </div>

        <div class="details">
            <div class="confirmations">
                {{ confirmations }} confirmation{{ confirmations === 1 ? '' : 's' }}
            </div>

            <div class="amount">
                {{ convertToCoin(amount) }} XZC
            </div>

            <div class="transactions">
                <label>Transaction IDs:</label>

                <div
                    v-for="txid of txids"
                    class="transaction"
                >
                    <div class="txid">
                        {{ txid }}
                    </div>

                    <div class="block-explorer">
                        <a @click.prevent="() => openExplorer(txid)" href="#">
                            View Transaction in Block Explorer
                        </a>
                    </div>
                </div>
            </div>
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
            consolidatedMints: 'Transactions/consolidatedMints',
            getExplorerTransactionUrl: 'Settings/getExplorerTransactionUrl',
            currentBlockHeight: 'Blockchain/currentBlockHeight'
        }),

        confirmations () {
            return this.blockHeight ? this.currentBlockHeight - this.blockHeight + 1 : 0;
        },

        // This MAY be NaN if we're not on the current route. Thefore we must check whether it is NaN before rendering
        // the component, or errors will be thrown when we navigate away from a mint-info/ path.
        blockHeight () {
            return Number(this.$route.params.blockHeight);
        },

        txids () {
            return this.consolidatedMints[this.blockHeight].mints
                .map(x => x.txid)
                .sort()
                .reduce((a, x) => x === a[a.length-1] ? a : [...a, x], []);
        },

        amount () {
            return this.consolidatedMints[this.blockHeight].totalMintAmount;
        }
    },

    methods: {
        convertToCoin,

        openExplorer (txid) {
            shell.openExternal(this.getExplorerTransactionUrl(txid));
        }
    }
}
</script>

<style scoped lang="scss">
.mint-info {
    height: 100%;
    background: $color--comet-light;
    color: $color--comet-dark;

    padding: {
        top: 2em;
        left: 2em;
        right: 2em;
    }

    font-size: 1.5em;

    .title {
        font-size: 2em;
    }

    .details {
        @include detail-header();

        .confirmations {
            font-size: 0.7em;
            font-style: italic;
        }

        .amount {
            font-size: 1.5em;
            text-align: right;
        }

        .txid {
            padding-top: 0.5em;

            font-size: 0.5em;
            font-family: monospace;
            font-style: italic;
        }

        .block-explorer {
            font-size: 0.5em;
            font-style: italic;
            text-underline: none;
        }
    }
}
</style>
