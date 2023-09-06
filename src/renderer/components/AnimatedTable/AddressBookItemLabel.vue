<template>
    <th v-if="isHeader">
        Label
    </th>

    <td v-else class="label">
        <div class="inner-label">
            {{ rowData.label || 'Unlabelled' }}
        </div>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "AddressBookItemLabel",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
td.label {
    width: var(--label-width);
    max-width: var(--label-width);

    .inner-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 5px;
    }
}
</style>
