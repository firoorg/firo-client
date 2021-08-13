<template>
    <div class="input-selection-popup">
        <div v-if="showBreakingMasternodeWarning" class="breaking-masternode-warning">
            Crossed out transactions are used as masternode collateral. Using them will break the associated node.
        </div>

        <AnimatedTable
            ref="vuetable"
            no-data-message="No inputs available"
            :data="ourUnspentUTXOs"
            :fields="fields"
            :global-data="selectionData"
            :row-class="lockedClassOfRow"
            track-by="uniqId"
        />

        <div class="two-button-holder">
            <button class="solid-button unrecommended" @click="cancel()">Cancel</button>
            <button class="solid-button recommended" @click="ok()">OK</button>
        </div>
    </div>
</template>

<script>
// $emits: input, cancel, ok
import {fromPairs} from "lodash";
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
        value: Array,
        isPrivate: Boolean
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
                .filter(([k, v]) => v)
                .map(([uniqId, v]) => this.transactions[uniqId]);
        },

        ourUnspentUTXOs() {
            return this.availableUTXOs
                .filter(tx => ['mint', 'mintIn'].includes(tx.category) === this.isPrivate)
                .sort((a, b) => (b.amount - a.amount) || a.txid.localeCompare(b.txid));
        }
    },

    methods: {
        ok() {
            this.$emit(this.selectedCoins.length ? 'ok' : 'cancel');
        },

        cancel() {
            this.selectionData = {};
            this.$emit('cancel');
        },

        lockedClassOfRow(row) {
            return row.locked ? 'locked' : 'unlocked';
        }
    },

    watch: {
        value() {
            this.selectionData = fromPairs(this.value.map(tx => [tx.uniqId, true]));
        },

        selectedCoins() {
            this.$emit('input', this.selectedCoins);
        }
    }
}
</script>

<style scoped lang="scss">
.input-selection-popup {
    padding: var(--padding-popup);

    .breaking-masternode-warning {
        text-align: center;
        margin-bottom: var(--padding-popup);
    }

    .animated-table {
        min-width: 50vw;
        height: 75vh;

        .locked {
            text-decoration: line-through;
        }
    }
}
</style>