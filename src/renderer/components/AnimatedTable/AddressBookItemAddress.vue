<template>
    <th v-if="isHeader">
        Address
    </th>

    <td v-else class="address-book-item-address">
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