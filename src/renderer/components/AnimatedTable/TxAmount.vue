<template>
    <th v-if="isHeader">Amount</th>
    <td v-else class="amount">
        {{ convertToCoin(rowData.amount) }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'
import {convertToCoin} from "lib/convert";

export default {
    name: 'TxAmount',

    mixins: [
        VuetableFieldMixin
    ],

    methods: {
        convertToCoin
    }
}

</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";

.amount {
    @include amount();
    text-align: right;
}
</style>