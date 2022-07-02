<template>
    <th
        v-if="isHeader"
        @click="$emit('click', rowField, $event)"
    >
        Label
    </th>

    <td v-else>
        <span v-if="label" class="label-text">
            {{ label }}
        </span>
    </td>
</template>

<script>
// The default values here should be coordinated with the assignment of extraSearchText in PaymentsList.

import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';
import {mapGetters} from "vuex";

export default {
    name: "AnimatedTableLabel",

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        ...mapGetters({
            addressBook: 'AddressBook/addressBook'
        }),

        label () {
            if (this.rowData.label) return this.rowData.label;
            const address = this.rowData.elysium ? this.rowData.elysium.receiver || this.rowData.elysium.sender : this.rowData.address;
            if (this.addressBook[address] && this.addressBook[address].label) return this.addressBook[address].label;
            if (!address) return "Unknown Address";
            return address;
        }
    }
}
</script>

<style scoped lang="scss">
</style>
