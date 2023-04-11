<template>
    <th v-if="isHeader"></th>
    <td v-else>
        <div class="buttons">
            <button v-if="!rowData.isLocked" class="solid-button recommended" @click="isLock(rowData)" style="width: 70px; height: 25px; min-width: 20px;">
                Lock
            </button>
            <button v-else class="solid-button unrecommended" @click="isLock(rowData)" style="width: 70px; height: 25px; min-width: 20px;">UnLock</button>
        </div>
    </td>
</template>

<script>
import Vue from 'vue';
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: 'UTXOSelector',

    mixins: [VuetableFieldMixin],

    props: { locked: Boolean },

    methods: {
        isLock(rowData) {
            const coincontrol = [rowData.txid, rowData.index];
            rowData.isLocked == false ? $daemon.updateCoinLocks('', [coincontrol], []) : $daemon.updateCoinLocks('', [], [coincontrol]);
            rowData.isLocked = !rowData.isLocked;
        },

        lock() {
            return this.locked;
        },
        unlock() {
            return !this.locked;
        }
    }
};
</script>

<style scoped lang="scss">
td {
    padding-right: var(--padding-base);
}
</style>
