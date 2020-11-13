<template>
    <th v-if="isHeader"></th>
    <td v-else>
        <input type="checkbox" v-model="isSelected" />
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

    data() {
        return {
            isSelected: false
        };
    },

    watch: {
        isSelected(val) {
            this.$emit('vuetable:field-event', [this.rowData.uniqId, val]);
        }
    }
}

</script>

<style scoped>

</style>