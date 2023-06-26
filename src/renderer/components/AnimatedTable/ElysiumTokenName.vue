<template>
    <th v-if="isHeader">Name</th>
    <td v-else class="elysium-name">{{ rowData.name }}</td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "ElysiumTokenName",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>