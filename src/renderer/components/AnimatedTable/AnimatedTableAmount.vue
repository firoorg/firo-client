<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-amount"
        @click="$emit('click', rowField, $event)"
    >
        Amount
    </th>

    <td v-else class="vuetable-td-component-amount">
        <span v-if="rowData.amount === 0">0</span>
        <span v-else-if="rowData.isFromMe" class="outgoing">-{{ amount }} FIRO</span>
        <span v-else-if="rowData.isToMe" class="incoming">+{{ amount }} FIRO</span>
    </td>
</template>

<script>
import { convertToCoin } from 'lib/convert'
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'AnimatedTableAmount',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        amount () {
            return convertToCoin(this.rowData.amount);
        }
    }
}
</script>

<style scoped lang="scss">
</style>
