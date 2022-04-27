<template>
    <th v-if="isHeader">Name</th>
    <td v-else class="elysium-name">{{ rowData.name }}</td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "ElysiumTokenName",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>