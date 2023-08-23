<template>
    <th v-if="isHeader">Amount</th>
    <td v-else class="amount">
        <Amount :amount="rowData.amount" />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'

export default {
    name: 'TxAmount',

    mixins: [
        VuetableFieldMixin
    ]
}

</script>

<style scoped lang="scss">
</style>