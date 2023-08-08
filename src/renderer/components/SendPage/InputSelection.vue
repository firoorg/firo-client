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
            track-by="uniqId"
        />

        <div class="two-button-holder">
            <button class="solid-button unrecommended" @click="cancel()">Cancel</button>
            <button class="solid-button recommended" @click="ok()">OK</button>
        </div>
    </div>
</template>

<script>
// $emits: update:modelValue, cancel, ok
import {markRaw} from "vue";
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
        TxAmount
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
                {name: markRaw(UTXOSelector)},
                {name: markRaw(TxIdIndex)},
                {name: markRaw(TxAmount)}
            ]
        }
    },

    computed: {
        ...mapGetters({
            TXOMap: 'Transactions/TXOMap',
            availableUTXOsWithLock: 'Transactions/availableUTXOsWithLock',
            isSparkAllowed: 'ApiStatus/isSparkAllowed'
        }),

        showBreakingMasternodeWarning() {
            return !!this.ourUnspentUTXOs.find(coin => coin.locked);
        },

        selectedCoins() {
            return Object.entries(this.selectionData)
                .filter(([k, v]) => v)
                .map(([txidIndex, v]) => this.TXOMap[txidIndex]);
        },

        ourUnspentUTXOs() {
            return this.availableUTXOsWithLock
                .filter(tx => tx.isPrivate === this.isPrivate)
                .sort((a, b) => Number(b.amount - a.amount) || a.txid.localeCompare(b.txid) || a.index - b.index)
                .map(tx => ({...tx, uniqId: `${tx.txid}-${tx.index}`}));
        }
    },

    methods: {
        ok() {
            this.$emit(this.selectedCoins.length ? 'ok' : 'cancel');
        },

        cancel() {
            this.selectionData = {};
            this.$emit('cancel');
        }
    },

    watch: {
        selectedCoins() {
            this.$emit('update:modelValue', this.selectedCoins);
        }
    }
}
</script>

<style scoped lang="scss">
.input-selection-popup {
    padding: var(--padding-base);

    .breaking-masternode-warning {
        text-align: center;
        margin-bottom: var(--padding-base);
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