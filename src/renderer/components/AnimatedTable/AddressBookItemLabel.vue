<template>
    <th v-if="isHeader">
        Label
    </th>

    <td v-else class="address-book-item-label">
        {{ rowData.label || 'Unlabelled' }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "AddressBookItemLabel",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>
