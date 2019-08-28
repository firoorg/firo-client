<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-last-seen"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-last-seen"
        :title="absoluteDateString"
    >
        <timeago
            v-if="date"
            :datetime="date"
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
    name: 'ZnodeLastSeen',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        date () {
            return this.rowData.lastSeen
        },

        absoluteDateString () {
            return format(new Date(this.date), "HH:MM, D MMM YYYY")
        }
    }
}
</script>

<style scoped>
</style>
