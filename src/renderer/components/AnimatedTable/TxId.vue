<template>
    <th v-if="isHeader">Transaction ID/Index</th>
    <td v-else class="txid-index">
        {{ rowData.txid }}-{{ rowData.index }}
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
.txid-index {
    user-select: text;
    font: {
        size: 0.8em;
        family: "Robot Mono";
    }
}
</style>