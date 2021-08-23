<template>
    <th v-if="isHeader" />
    <td v-else>
        <div class="current-indicator" :class="rowData.isSelected ? 'selected' : 'not-selected'" />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "CurrentIndicator",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
td {
    width: 40px;

    .current-indicator {
        height: 14px;
        width: 14px;

        border: {
            radius: 7px;
            color: var(--color-text-disabled);
            width: 2px;
            style: solid;
        }

        &.selected {
            border-color: var(--color-secondary);
            background-color: var(--color-secondary);
        }
    }
}
</style>