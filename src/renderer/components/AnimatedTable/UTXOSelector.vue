<template>
    <th v-if="isHeader"></th>
    <td v-else>
        <input v-if="!rowData.isLocked"  :id="`utxo-selector-${this.txidIndex}`" class="utxo-selector" type="checkbox" v-model="checkbox"/>
        <input v-else :disabled="true" :id="`utxo-selector-${this.txidIndex}`" class="disable-checkbox" type="checkbox" v-model="checkbox" :checked="false"/>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'

export default {
    name: 'UTXOSelector',

    mixins: [
        VuetableFieldMixin
    ],

    data() {
        return {
            checkbox: false
        }
    },

    computed: {
        txidIndex() {
            return `${this.rowData.txid}-${this.rowData.index}`;
        }
    },

    watch: {
        rowData() {
            this.checkbox = !!this.vuetable.globalData[this.txidIndex];
        },

        checkbox() {
            this.vuetable.globalData[this.txidIndex] = this.checkbox;
        }
    }
}

</script>

<style scoped lang="scss">
td {
    padding-right: var(--padding-base);
}
input[type=checkbox].disable-checkbox {
    background-color: rgba(0,0,0,0.1);
    border: 1px solid rgba(0,0,0,0.1);
}
</style>