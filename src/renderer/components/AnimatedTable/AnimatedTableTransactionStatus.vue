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
        :class="{'is-confirmed': isConfirmed}"
    >
        <span
            v-if="direction === 'incoming'"
            class="ok is-incoming"
        >
            ⬇
        </span>
        <span
            v-else-if="direction === 'outgoing'"
            class="ok is-outgoing"
        >
            ⬆
        </span>
        <span
            v-else-if="direction === 'mint'"
            class="ok is-mint"
        >
            ⓩ
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
        confirmationsCount () {
            return this.rowData.confirmations
        },

        direction () {
            return this.rowData.direction
        },

        isConfirmed () {
            return this.rowData.isConfirmed
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