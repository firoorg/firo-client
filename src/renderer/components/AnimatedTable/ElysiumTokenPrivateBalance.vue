<template>
    <th v-if="isHeader">Private Balance</th>
    <td v-else>
        <Amount class="elysium-private-balance" :amount="rowData.privateBalance" />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';
import Amount from "renderer/components/shared/Amount.vue";

export default {
    name: "ElysiumTokenPrivateBalance",

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