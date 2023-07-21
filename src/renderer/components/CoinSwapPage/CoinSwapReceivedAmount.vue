<template>
    <th v-if="isHeader" class="vuetable-th-component-coinswap-received-amount" @click="$emit('click', rowField, $event)">
        Amount to Receive
    </th>

    <td v-else class="vuetable-td-component-coinswap-received-amount">
        <Amount :amount='rowData.expectedAmountToReceive' :ticker='rowData.toCoin' />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'
import Amount from '../shared/Amount.vue';

export default {
    name: 'CoinSwapSentAmount',

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
