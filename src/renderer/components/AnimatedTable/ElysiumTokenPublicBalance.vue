<template>
    <th v-if="isHeader">Public Balance</th>
    <td v-else>
        <Amount class="elysium-public-balance" :amount="rowData.publicBalance" />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';
import Amount from "renderer/components/shared/Amount.vue";

export default {
    name: "ElysiumTokenPendingBalance",

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