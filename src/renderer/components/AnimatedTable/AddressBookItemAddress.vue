<template>
    <th v-if="isHeader" class="address">
        Address
    </th>

    <td v-else class="address">
        {{ rowData.address }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "PaymentRequestAddress",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
td {
    width: available;
    max-width: 1px; // (╯°Д°）╯
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>