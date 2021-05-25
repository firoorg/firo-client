<template>
    <th
        v-if="isHeader"
        @click="$emit('click', rowField, $event)"
    >
        Label
    </th>

    <td
        v-else
        :class="`${category}-label`"
    >
        <span v-if="label" class="label-text">
            {{ label }}
        </span>

        <span v-else-if="category === 'mint'">
            Private Mint
        </span>

        <span v-else-if="category === 'mined'">
            Mined Transaction
        </span>

        <span v-else-if="category === 'znode'">
            Znode Payment
        </span>

        <span v-else-if="['send', 'spendOut'].includes(category)">
            Outgoing Transaction ({{ address }})
        </span>

        <span v-else-if="['receive', 'spendIn', 'mintIn'].includes(category)">
            Incoming Transaction ({{ address }})
        </span>

        <span v-else>
            Unknown Transaction: This is a bug
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

        category () {
            return this.rowData.category;
        },

        address () {
            return this.rowData.address;
        },

        label () {
            if (this.rowData.label) return this.rowData.label;
            if (this.addressBook[this.address]) return this.addressBook[this.address].label;
        },

        paymentRequestAddress () {
            return this.category === 'payment-request' ? this.rowData.address : null;
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/colors";

.payment-request-label {
    color: var(--color-text-disabled);
}

td > span:not(.label-text) {
    font-style: italic;
}
</style>
