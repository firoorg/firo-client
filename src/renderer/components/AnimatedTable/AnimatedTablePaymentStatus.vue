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
        :title="confirmationsCount + ' confirmations'"
        :class="{'is-confirmed': !!confirmationsCount}"
    >
        <span
            v-if="paymentType === 'incoming'"
            class="ok is-incoming"
        >
            ⬇
        </span>
        <span
            v-else-if="paymentType === 'outgoing'"
            class="ok is-outgoing"
        >
            ⬆
        </span>
        <span
            v-else-if="paymentType === 'mint'"
            class="ok is-mint"
        >
            ⓩ
        </span>
        <span
            v-else-if="paymentType === 'payment-request'"
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

        paymentType () {
            return this.rowData.paymentType;
        },

        confirmationsCount () {
            return this.rowData.blockHeight && this.rowData.blockHeight - this.currentBlockHeight;
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
    }
</style>