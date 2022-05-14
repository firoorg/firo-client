<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-relative-date"
        @click="$emit('click', rowField, $event)"
    >
        Date
    </th>
    <td v-else-if="!rowData.blockHeight && !rowData.isInstantSendLocked" class="unconfirmed">Unconfirmed</td>
    <td v-else-if="rowData.date" class="confirmed">{{createDate}}</td>
    <td
        v-else
        class="vuetable-td-component-relative-date"
        :title="absoluteDate || 'Pending'"
    >
        <timeago :datetime="rowData.firstSeenAt * 1000"  :auto-update="30" />
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
        absoluteDate () {
            return format(new Date(this.rowData.firstSeenAt * 1000), "HH:MM, D MMM YYYY")
        },
        createDate () {
            return format(new Date(this.rowData.date), "HH:MM, D MMM YYYY")
        }
    }
}
</script>

<style scoped lang="scss">
.unconfirmed {
    font-style: italic;
}
</style>
