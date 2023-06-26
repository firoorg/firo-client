<template>
    <th v-if="isHeader"></th>
    <td v-else>
        <input :id="`utxo-selector-${this.txidIndex}`" class="utxo-selector" type="checkbox" v-model="checkbox" />
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
</style>