<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-relative-date"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-relative-date"
    >
        <timeago
            :key="rowData.id"
            :datetime="relativeDate"
            :auto-update="30"
        />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'AnimatedTableRelativeDate',
    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        relativeDate () {
            return this.rowData[this.rowField.dateField]
        }
    }
}
</script>

<style scoped>

</style>
