<template>
    <div>
        <AnimatedTable
            ref="vuetable"
            :data="ourUnspentUTXOs"
            :fields="fields"
            :anti-overflow-hack="false"
            :global-data="selectionData"
            track-by="uniqId"
        />
    </div>
</template>

<script>
// $emits: input
import {mapGetters} from "vuex";
import {cloneDeep} from "lodash";
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

        selectedCoins() {
            return Object.entries(this.selectionData)
                .filter(([k, v]) => !!v)
                .map(([uniqId, v]) => this.transactions[uniqId]);
        },

        ourUnspentUTXOs() {
            return this.availableUTXOs
                .filter(tx => (tx.category === 'mint') === this.isPrivate)
                .sort((a, b) => (b.amount - a.amount) || a.txid.localeCompare(b.txid));
        }
    },

    watch: {
        selectedCoins() {
            this.$emit('input', this.selectedCoins);
        }
    }
}
</script>

<style scoped>
.animated-table {
    min-width: 50vw;
}
</style>