<template>
    <th v-if="isHeader">Amount</th>
    <td v-else-if="!rowData.isLocked" class="amount">
        {{ bigintToString(rowData.amount) }} 
    </td>
    <td v-else class="disable-txt">
        {{ bigintToString(rowData.amount) }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'
import {bigintToString} from "lib/convert";

export default {
    name: 'TxAmount',

    mixins: [
        VuetableFieldMixin
    ],

    methods: {
        bigintToString
    }
}

</script>

<style scoped lang="scss">
.disable-txt {
    color: rgba(0,0,0,0.3);
}
</style>