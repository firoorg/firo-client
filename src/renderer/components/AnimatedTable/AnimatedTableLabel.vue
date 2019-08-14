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
        <span
            v-if="category === 'payment-request'"
            class="payment-request-warning"
        >
            Payment Request:
        </span>

        <span
            v-if="['spendIn', 'spendOut'].includes(category)"
            class="private-icon"
        >
            ⓩ
        </span>

        <span v-if="label">
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
            Outgoing Transaction
        </span>

        <span v-else-if="['receive', 'spendIn'].includes(category)">
            Incoming Transaction
        </span>

        <span v-else-if="category === 'payment-request'">
            {{ paymentRequestAddress }}
        </span>

        <span v-else>
            Unknown Transaction: This is a bug
        </span>
    </td>
</template>

<script>
// The default values here should be coordinated with the assignment of extraSearchText in PaymentsList.

import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "AnimatedTableLabel",

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        category () {
            return this.rowData.category;
        },

        label () {
            return this.rowData.label;
        },

        paymentRequestAddress () {
            return this.category === 'payment-request' ? this.rowData.address : null;
        }
    }
}
</script>

<style scoped lang="scss">
.payment-request-label {
    color: gray;

    .payment-request-warning {
        font-style: italic;
    }
}

.private-icon {
    color: green;
}

.mint-label {
    font-style: italic;
}

.mined-label {
    font-style: italic;
}
</style>