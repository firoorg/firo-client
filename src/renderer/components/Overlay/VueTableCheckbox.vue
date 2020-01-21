

<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-checkbox"
    >
        <input
            type="checkbox"
            :checked="isAllItemsInCurrentPageSelected()"
            @change="toggleAllCheckbox($event)"
        >
    </th>
    <td
        v-else
        class="vuetable-td-component-checkbox"
    >
        <input
            type="checkbox"
            :checked="isSelected(rowData)"
            @change="doToggle(rowData, $event)"
        >
    </td>
</template>
<script>
import VuetableFieldCheckboxMixin from 'vuetable-2/src/components/VuetableFieldCheckboxMixin.vue'

// this is a hack around for unmaintain vue2table 2 checkbox
export default {
    name: 'VueTableCheckbox',

    mixins: [VuetableFieldCheckboxMixin],

    methods: {
        doToggle: function (dataItem, event) {
            this.vuetable.fireEvent('checkbox-toggled-custom', event.target.checked, dataItem)
            this.vuetable.onCheckboxToggled(event.target.checked, this.rowField.name, dataItem)
        }
    },
}
</script>