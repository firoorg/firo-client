<template>
    <th v-if="isHeader">
        Type
    </th>
    
    <td v-else class="address-type">
        <div class="inner-address-type">
            {{ rowData.addressType.toLowerCase() }}
        </div>
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
td.address-type {
    width: 180px;
    max-width: 180px;

    .inner-address-type {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 5px;
    }
}
</style>
