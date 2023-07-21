<template>
    <th v-if="isHeader" class="vuetable-th-component-coinswap-sent-amount" @click="$emit('click', rowField, $event)">
        Amount to Send
    </th>

    <td v-else class="vuetable-td-component-coinswap-sent-amount">
        <Amount :amount="rowData.sendAmount" :ticker="rowData.fromCoin" />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'
import Amount from 'renderer/components/shared/Amount';

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
