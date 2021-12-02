<template>
    <th v-if="isHeader">Public Balance</th>
    <td v-else>
        <Amount :amount="rowData.publicBalance" />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';
import Amount from "renderer/components/shared/Amount";

export default {
    name: "ElysiumTokenPublicBalance",

    mixins: [
        VuetableFieldMixin
    ],

    components: {
        Amount
    }
}
</script>

<style scoped lang="scss">
</style>