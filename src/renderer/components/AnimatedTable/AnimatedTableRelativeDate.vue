<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-relative-date"
        @click="$emit('click', rowField, $event)"
    >
        Date
    </th>
    <td
        v-else
        class="vuetable-td-component-relative-date"
        :title="absoluteDate || 'Pending'"
        :class="`${category}-date`"
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
import { format } from 'date-fns'

export default {
    name: 'RelativeDate',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        category () {
            return this.rowData.category;
        },

        relativeDate () {
            let d = this.rowData.date;
            // If we're set to Infinity, don't render anything. We do this instead of just putting undefined here in
            // order to get sorted before everything else.
            if (d === Infinity) {
                return undefined
            }

            return d
        },

        absoluteDate () {
            const d = this.rowData.date;
            // If we're set to Infinity, don't render anything. We do this instead of just putting undefined here in
            // order to get sorted before everything else.
            if (d === Infinity) {
                return undefined
            }

            return format(new Date(d), "HH:MM, D MMM YYYY")
        }
    }
}
</script>

<style scoped>
.payment-request-date {
    color: gray;
}
</style>
