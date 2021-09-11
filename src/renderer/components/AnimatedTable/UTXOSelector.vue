<template>
    <th v-if="isHeader"></th>
    <td v-else>
        <input :id="`utxo-selector-${this.txidIndex}`" class="utxo-selector" ref="checkbox" type="checkbox" @input="toggle" />
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

    computed: {
        txidIndex() {
            return `${this.rowData.txid}-${this.rowData.index}`;
        }
    },

    watch: {
        rowData() {
            this.$refs.checkbox.checked = !!this.vuetable.globalData[this.txidIndex];
        }
    },

    methods: {
        toggle(ev) {
            Vue.set(this.vuetable.globalData, this.txidIndex, ev.target.checked);
        }
    }
}

</script>

<style scoped lang="scss">
td {
    padding-right: var(--padding-base);
}
</style>