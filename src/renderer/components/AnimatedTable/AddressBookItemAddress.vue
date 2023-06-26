<template>
    <th v-if="isHeader" class="address">
        Address
    </th>

    <td v-else class="address">
        {{ rowData.address }}
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
</style>