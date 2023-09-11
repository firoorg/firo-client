<template>
    <th v-if="isHeader">Amount</th>
    <td v-else class="amount">
        <Amount :amount="rowData.amount" />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';
import Amount from 'renderer/components/shared/Amount.vue';

export default {
    name: 'TxAmount',

    mixins: [
        VuetableFieldMixin
    ],

    components: {
        Amount
    }
}

</script>

<style scoped lang="scss">
</style>