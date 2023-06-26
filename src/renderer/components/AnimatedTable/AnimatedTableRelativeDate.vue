<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-relative-date"
        @click="$emit('click', rowField, $event)"
    >
        Date
    </th>
    <td v-else-if="rowData.date" class="confirmed">{{createDate}}</td>
    <td v-else-if="!rowData.blockHeight && !rowData.isInstantSendLocked" class="unconfirmed">Unconfirmed</td>
    <td
        v-else
        class="vuetable-td-component-relative-date"
        :title="absoluteDate || 'Pending'"
    >
        {{ relativeDate }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'
import { format } from 'date-fns'
import {ago} from "time-ago";

export default {
    name: 'RelativeDate',

    mixins: [
        VuetableFieldMixin
    ],

    data() {
        return {
            tick: 0,
            timer: null
        };
    },

    mounted() {
        this.timer = setInterval(() => this.tick++, 30e3);
    },

    unmounted() {
        clearInterval(this.timer);
    },

    computed: {
        relativeDate() {
            this.tick;
            return ago(this.rowData.firstSeenAt * 1000);
        },

        absoluteDate () {
            return format(new Date(this.rowData.firstSeenAt * 1000), "HH:MM, d MMM yyyy")
        },

        createDate () {
            return format(new Date(this.rowData.date), "HH:MM, d MMM yyyy")
        }
    }
}
</script>

<style scoped lang="scss">
.unconfirmed {
    font-style: italic;
}
</style>
