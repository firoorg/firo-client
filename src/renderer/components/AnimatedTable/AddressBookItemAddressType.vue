<template>
    <th v-if="isHeader">
        Type
    </th>
    
    <td v-else class="address-book-item-label">
        {{ rowData.inputPrivacy || rowData.addressType.toLowerCase() }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "AddressBookItemAddressType",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
td.address-book-item-label {
    width: 180px;
    max-width: 180px;
    overflow: hidden;
    white-space: nowrap;
}
</style>
