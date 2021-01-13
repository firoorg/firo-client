<template>
    <th v-if="isHeader">
        Next Payment Block
    </th>

    <td v-else-if="rowData.state.nextPaymentHeight">
        {{ rowData.state.nextPaymentHeight }}
    </td>

    <td v-else class="banned">
        POSE_BANNED
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
.banned {
    font-weight: bold;
}
</style>
