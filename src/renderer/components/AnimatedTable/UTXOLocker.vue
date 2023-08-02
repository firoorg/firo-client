<template>
    <th v-if="isHeader"></th>
    <td v-else>
        <div class="buttons">
            <button v-if="!rowData.isLocked" class="solid-button recommended lock-button" @click="changeLock(rowData)">
                Lock
            </button>
            <button v-else class="solid-button unrecommended lock-button" @click="changeLock(rowData)">UnLock</button>
        </div>
    </td>
</template>

<script>

import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: 'UTXOLocker',

    mixins: [VuetableFieldMixin],

    methods: {
        changeLock(rowData) {
            const coincontrol = [rowData.txid, rowData.index];
            rowData.isLocked == false ? $daemon.updateCoinLocks('', [coincontrol], []) : $daemon.updateCoinLocks('', [], [coincontrol]);
            rowData.isLocked = !rowData.isLocked;
            let txidIndex = `${rowData.txid}-${rowData.index}`;
            if(rowData.isLocked) this.vuetable.globalData[txidIndex] = false;
        }
    }
};
</script>

<style scoped lang="scss">
td {
    padding-right: var(--padding-base);
}
.lock-button {
    width: 70px;
    height: 25px;
    min-width: 20px;
}
</style>
