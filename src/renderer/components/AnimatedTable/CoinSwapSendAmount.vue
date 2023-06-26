<template>
    <th v-if="isHeader" class="vuetable-th-component-coinswap-sent-amount" @click="$emit('click', rowField, $event)">
        Amount to Send
    </th>

    <td v-else class="vuetable-td-component-coinswap-sent-amount">
        <span class="amount">{{ rowData.sendAmount }}</span>
        <span class="ticker">{{ rowData.fromCoin }}</span>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'

export default {
    name: 'CoinSwapSentAmount',

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>
