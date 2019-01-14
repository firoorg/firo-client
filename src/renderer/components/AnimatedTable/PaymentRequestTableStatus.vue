<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-payment-request-status"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-relative-date"
    >
        <payment-request-status
            :key="rowData.id"
            :is-fulfilled="isFulfilled"
            :is-incoming="isIncoming"
            :is-reused="isReused"
            class="icon"
        />
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'
import PaymentRequestStatus from '@/components/Icons/PaymentRequestTableStatus'

export default {
    name: 'PaymentRequestTableStatus',
    components: {
        PaymentRequestStatus
    },
    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        isFulfilled () {
            return this.rowData[this.rowField.isFulfilledKey || 'isFulfilled']
        },

        isIncoming () {
            return this.rowData[this.rowField.transationsReceivedKey || 'isIncoming']
        },

        isReused () {
            return this.rowData[this.rowField.isReusedKey || 'isReused']
        }
    }
}
</script>

<style lang="scss" scoped>
    .vuetable-th-component-payment-request-status {
        padding-left: 0.85rem;
        padding-right: 0;
        min-width: 2rem;
    }

    .icon {
        width: emRhythm(2);
        margin-right: emRhythm(1);
    }
</style>
