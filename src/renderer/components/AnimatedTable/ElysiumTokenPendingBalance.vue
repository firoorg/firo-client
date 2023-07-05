<template>
    <th v-if="isHeader">Pending Balance</th>
    <td v-else>
        <Amount class="elysium-pending-balance" :amount="rowData.pendingBalance" />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';
import Amount from "renderer/components/shared/Amount";

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