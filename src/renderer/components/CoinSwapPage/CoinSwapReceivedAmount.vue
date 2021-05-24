<template>
    <th v-if="isHeader" class="vuetable-th-component-coinswap-received-amount" @click="$emit('click', rowField, $event)">
        Amount to Receive
    </th>

    <td v-else class="vuetable-td-component-coinswap-received-amount">
        <span class="amount">{{ rowData.expectedAmountToReceive }}</span>
        <span class="ticker">{{ rowData.toCoin }}</span>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'CoinSwapSentAmount',

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/typography";

.amount {
    @include amount();
    color: var(--color-amount-negative);
}

.ticker {
    @include ticker();
}
</style>
