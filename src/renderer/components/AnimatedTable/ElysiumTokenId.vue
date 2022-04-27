<template>
    <th v-if="isHeader">ID</th>
    <td v-else class="elysium-id">{{ rowData.id }}</td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "ElysiumTokenId",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>