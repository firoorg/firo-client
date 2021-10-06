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
        <span v-else-if="rowData.isFromMe && rowData.isToMe" class="incoming-outgoing">±<Amount :amount="rowData.amount" ticker="FIRO" /></span>
        <span v-else-if="rowData.isFromMe" class="outgoing">-<Amount :amount="rowData.amount" ticker="FIRO" /></span>
        <span v-else-if="rowData.isToMe" class="incoming">+<Amount :amount="rowData.amount" ticker="FIRO" /></span>
    </td>
</template>

<script>
import { convertToCoin } from 'lib/convert'
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'
import Amount from 'renderer/components/shared/Amount';

export default {
    name: 'AnimatedTableAmount',

    components: {
        Amount
    },

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>
