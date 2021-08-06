<template>
    <div>
        <div v-if="showBreakingMasternodeWarning" class="breaking-masternode-warning">
            Crossed out transactions are used as masternode collateral. Using them will break the associated node.
        </div>

        <AnimatedTable
            ref="vuetable"
            :data="ourUnspentUTXOs"
            :fields="fields"
            :anti-overflow-hack="true"
            :global-data="selectionData"
            :row-class="lockedClassOfRow"
            track-by="uniqId"
        />
    </div>
</template>

<script>
// $emits: input
import {mapGetters} from "vuex";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable";
import UTXOSelector from "renderer/components/AnimatedTable/UTXOSelector";
import TxIdIndex from "renderer/components/AnimatedTable/TxId";
import TxAmount from "renderer/components/AnimatedTable/TxAmount";

export default {
    name: "InputSelection",

    components: {
        AnimatedTable,
        UTXOSelector,
        TxIdIndex,
        TxAmount,
    },

    props: {
        value: {
            type: Array, // TransactionOutput[]
            required: true // We should be passed an empty Array to begin with.
        },

        isPrivate: {
            type: Boolean,
            required: true
        }
    },

    data() {
        return {
            allowSendingLockedCoins: false,
            selectionData: {},
            fields: [
                {name: UTXOSelector},
                {name: TxIdIndex},
                {name: TxAmount}
            ]
        }
    },

    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            availableUTXOs: 'Transactions/availableUTXOs'
        }),

        showBreakingMasternodeWarning() {
            return !!this.ourUnspentUTXOs.find(coin => coin.locked);
        },

        selectedCoins() {
            return Object.entries(this.selectionData)
                .filter(([k, v]) => !!v)
                .map(([uniqId, v]) => this.transactions[uniqId]);
        },

        ourUnspentUTXOs() {
            return this.availableUTXOs
                .filter(tx => ['mint', 'mintIn'].includes(tx.category) === this.isPrivate)
                .sort((a, b) => (b.amount - a.amount) || a.txid.localeCompare(b.txid));
        }
    },

    methods: {
        lockedClassOfRow(row) {
            return row.locked ? 'locked' : 'unlocked';
        }
    },

    watch: {
        selectedCoins() {
            this.$emit('input', this.selectedCoins);
        }
    }
}
</script>

<style lang="scss">
@import "src/renderer/styles/typography";
@import "src/renderer/styles/sizes";

.breaking-masternode-warning {
    @include guidance();
    text-align: center;
    margin-bottom: $size-medium-space;
}

.animated-table {
    min-width: 50vw;
    max-height: 75vh;

    .locked {
        text-decoration: line-through;
    }
}
</style>