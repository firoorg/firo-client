<template>
    <th v-if="isHeader" class="address">
        Address
    </th>

    <td v-else class="address">
        <div class="inner-address">
            {{ rowData.address }}
        </div>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "PaymentRequestAddress",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">

td.address {
    width: available;
    max-width: 1px;

    .inner-address {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 5px;
    }
}
</style>