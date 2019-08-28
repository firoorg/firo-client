<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-active-since"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-active-since"
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
    name: 'ZnodeActiveSince',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        date () {
            return this.rowData.activeSince
        },

        absoluteDateString () {
            return format(new Date(this.date), "HH:MM, D MMM YYYY")
        }
    }
}
</script>

<style scoped>
</style>
