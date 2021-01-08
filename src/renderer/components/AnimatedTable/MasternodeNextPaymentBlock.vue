<template>
    <th v-if="isHeader">
        Next Payment Block
    </th>

    <td v-else>
        {{ rowData.state.nextPaymentHeight }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "MasternodeNextPaymentBlock",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>
