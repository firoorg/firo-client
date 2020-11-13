<template>
    <div>
        <AnimatedTable
            ref="vuetable"
            :selected-to="selectedRows"
            :data="ourUnspentUTXOs"
            :fields="fields"
            :anti-overflow-hack="false"
            track-by="uniqId"
            @field-event="handleSelectionEvent($event)"
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
            selectedRows: [],
            fields: [
                {name: UTXOSelector},
                {name: TxIdIndex},
                {name: TxAmount}
            ]
        }
    },

    methods: {
        handleSelectionEvent([uniqId, value]) {
            this.selectedRows = this.selectedRows.filter(x => x !== uniqId);
            if (value) this.selectedRows.push(uniqId);
        }
    },

    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            unspentUTXOs: 'Transactions/unspentUTXOs',
        }),

        selectedCoins() {
            return this.selectedRows.map(uniqId => this.transactions[uniqId]);
        },

        ourUnspentUTXOs() {
            return this.unspentUTXOs.filter(tx => {
                if (this.isPrivate) return tx.category === 'mint';
                else return tx.category !== 'mint';
            })
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