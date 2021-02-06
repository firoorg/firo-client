<template>
    <th v-if="isHeader"></th>
    <td v-else>
        <input :id="`utxo-selector-${this.rowData.txid}-${this.rowData.txIndex}`" class="utxo-selector" ref="checkbox" type="checkbox" @input="toggle" />
    </td>
</template>

<script>
import Vue from 'vue';
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'UTXOSelector',

    mixins: [
        VuetableFieldMixin
    ],

    watch: {
        rowData() {
            this.$refs.checkbox.checked = !!this.vuetable.globalData[this.rowData.uniqId];
        }
    },

    methods: {
        toggle(ev) {
            Vue.set(this.vuetable.globalData, this.rowData.uniqId, ev.target.checked);
        }
    }
}

</script>

<style scoped>

</style>