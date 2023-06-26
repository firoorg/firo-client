<template>
    <th v-if="isHeader">Amount</th>
    <td v-else class="amount">
        {{ bigintToString(rowData.amount) }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'
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
</style>