<template>
    <th v-if="isHeader"></th>
    <td v-else>
        <input v-if="!rowData.isLocked"  :id="`utxo-selector-${this.txidIndex}`" class="utxo-selector" ref="checkbox" type="checkbox" @input="toggle" />
        <input v-else :disabled="true" :id="`utxo-selector-${this.txidIndex}`" class="disable-checkbox" ref="checkbox" type="checkbox" @input="toggle" :checked="false"/>
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
input[type=checkbox].disable-checkbox {
    background-color: rgba(0,0,0,0.1);
    border: 1px solid rgba(0,0,0,0.1);
}
</style>