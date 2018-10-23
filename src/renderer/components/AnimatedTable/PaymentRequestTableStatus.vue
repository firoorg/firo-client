<template>
    <th v-if="isHeader"
        class="vuetable-th-component-relative-date"
        v-html="title"
        @click="$emit('click', rowField, $event)"
    ></th>
    <td v-else
        class="vuetable-td-component-relative-date"
    >
        <payment-request-status :is-fulfilled="isFulfilled"
                                :is-incoming="isIncoming"
                                :is-reused="isReused"
                                class="icon"
                                :key="rowData.id" />
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
    .icon {
        width: emRhythm(2);
        margin-right: emRhythm(1);
    }
</style>
