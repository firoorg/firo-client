<template>
    <th v-if="isHeader">
        Address
    </th>

    <td v-else class="label">
        {{ rowData.address || 'Untitled' }}
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