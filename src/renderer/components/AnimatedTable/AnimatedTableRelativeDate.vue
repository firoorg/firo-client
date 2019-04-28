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
            v-if="relativeDate"
            :key="rowData.id"
            :datetime="relativeDate"
            :auto-update="30"
        />
        <span v-else>
            ~
        </span>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'RelativeDate',
    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        relativeDate () {
            let d = this.rowData[this.rowField.dateField]
            // If we're set to Infinity, don't render anything. We do this instead of just putting undefined here in
            // order to get sorted before everything else.
            if (d === Infinity) {
                return undefined
            }

            return d
        }
    }
}
</script>

<style scoped>

</style>
