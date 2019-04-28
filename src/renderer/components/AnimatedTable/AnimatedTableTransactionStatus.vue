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
    >
        <span
            v-if="isError"
            class="error"
        >
            ❗
        </span>
        <span
            v-else-if="isIncoming"
            class="ok is-incoming"
            :class="{'is-confirmed': isConfirmed}"
        >
            ⬇
        </span>
        <span
            v-else
            class="is-outgoing"
            :class="{'is-confirmed': isConfirmed}"
        >
            ⬆
        </span>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'
import OutgoingPaymentStatus from '@/components/Icons/OutgoingPaymentTableStatus'

export default {
    name: 'OutgoingPaymentTableStatus',

    components: {
        OutgoingPaymentStatus
    },

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        isError () {
            return this.rowData.isError
        },

        isIncoming () {
            return this.rowData.amount >= 0
        },

        isConfirmed () {
            return this.rowData.isConfirmed
        }
    }
}
</script>

<style lang="scss">
    .vuetable-td-component-transaction-status {
        .is-confirmed {
            color: green;
        }

        :not(.is-confirmed) {
            color: orange;
        }
    }
</style>