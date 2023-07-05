<template>
    <th v-if="isHeader">
        Collateral Address
    </th>

    <td v-else class="address">
        {{ rowData.collateralAddress }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "MasternodeCollateralAddress",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
.address {
    font-family: "Robot Mono";
    font-size: 0.9em;
}
</style>
