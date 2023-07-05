<template>
    <th v-if="isHeader">
        IP
    </th>

    <td v-else>
        {{ rowData.state.service }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "MasternodeIP",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
td {
    text-align: left;
}
</style>
