<template>
    <th v-if="isHeader">Transaction ID/Index</th>
    <td class="txid" v-else>
        {{ rowData.txid }}-{{ rowData.txIndex }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'UTXOSelector',

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";

.txid {
    @include txid();
}
</style>