<template>
    <th v-if="isHeader">
        Collateral Address
    </th>

    <td v-else class="address">
        {{ rowData.collateralAddress }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "MasternodeCollateralAddress",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";

.address {
    @include address();
    font-size: 0.9em;
}
</style>
