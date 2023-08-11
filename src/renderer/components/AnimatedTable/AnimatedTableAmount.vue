<template>
    <th v-if="isHeader">Amount</th>

    <td v-else>
        <span v-if="rowData.elysium && rowData.isFromMe && rowData.elysium.isToMe">±<ElysiumAmount :tx="rowData" /></span>
        <span v-else-if="rowData.elysium && rowData.isFromMe">-<ElysiumAmount :tx="rowData" /></span>
        <span v-else-if="rowData.elysium && rowData.elysium.isToMe">+<ElysiumAmount :tx="rowData" /></span>
        <span v-else-if="rowData.amount === 0">0</span>
        <span v-else-if="rowData.isFromMe && rowData.isToMe" class="incoming-outgoing">±<Amount :amount="rowData.amount" ticker="FIRO" /></span>
        <span v-else-if="rowData.isFromMe" class="outgoing">-<Amount :amount="rowData.amount" ticker="FIRO" /></span>
        <span v-else-if="rowData.isToMe" class="incoming">+<Amount :amount="rowData.amount" ticker="FIRO" /></span>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'
import Amount from 'renderer/components/shared/Amount.vue';
import ElysiumAmount from "renderer/components/shared/ElysiumAmount.vue";

export default {
    name: 'AnimatedTableAmount',

    components: {
        ElysiumAmount,
        Amount
    },

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>
