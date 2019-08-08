<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-transaction-status"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-transaction-status"
        :title="`${confirmations} confirmations`"
        :class="{'is-confirmed': confirmations > 1}"
    >
        <span
            v-if="['spendIn', 'receive', 'mined'].includes(category)"
            class="ok is-incoming"
        >
            ⬇
        </span>
        <span
            v-else-if="['spendOut', 'send'].includes(category)"
            class="ok is-outgoing"
        >
            ⬆
        </span>
        <span
            v-else-if="category === 'mint'"
            class="ok is-mint"
        >
            ⓩ
        </span>
        <span
            v-else-if="category === 'payment-request'"
            class="is-payment-request"
        >
            …
        </span>
        <span
            v-else
            class="error"
        >
            ❗
        </span>
    </td>
</template>

<script>
import { mapGetters } from 'vuex';
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'
import OutgoingPaymentStatus from '@/components/Icons/OutgoingPaymentTableStatus'

export default {
    name: 'TransactionStatus',

    components: {
        OutgoingPaymentStatus
    },

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        ...mapGetters({
            currentBlockHeight: 'Blockchain/currentBlockHeight'
        }),

        category () {
            return this.rowData.category;
        },

        confirmations () {
            return (this.rowData.blockHeight || 0) && (1 + this.currentBlockHeight - this.rowData.blockHeight);
        }
    }
}
</script>

<style lang="scss">
    .vuetable-td-component-transaction-status {
        &.is-confirmed {
            color: green;
        }

        &:not(.is-confirmed) {
            color: orange;
        }

        .is-outgoing {
            color: red;
        }
    }
</style>