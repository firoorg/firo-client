<template>
    <th v-if="isHeader"></th>
    <td v-else>
        <input v-if="!rowData.isLocked" :id="`utxo-selector-${this.txidIndex}`" class="utxo-selector" type="checkbox" v-model="vuetable.globalData[this.txidIndex]"/>
        <input v-else :disabled="true" :id="`utxo-selector-${this.txidIndex}`" class="disable-checkbox" type="checkbox" v-model="vuetable.globalData[this.txidIndex]" :checked='false'/>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'

export default {
    name: 'UTXOSelector',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        txidIndex() {
            return `${this.rowData.txid}-${this.rowData.index}`;
        }
    }
}

</script>

<style scoped lang="scss">
td {
    padding-right: var(--padding-base);
}
input[type=checkbox].disable-checkbox {
    padding-right: var(--padding-base);
    background-color: rgba(0,0,0,0.1);
    border: 1px solid rgba(0,0,0,0.1);
}
</style>