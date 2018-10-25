<template>
    <th v-if="isHeader"
        class="vuetable-th-component-relative-date"
        v-html="title"
        @click="$emit('click', rowField, $event)"
    ></th>
    <td v-else
        class="vuetable-td-component-relative-date"
    >
        <outgoing-payment-status :is-confirmed="isConfirmed"
                                class="icon"
                                :key="rowData.id" />
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
            isConfirmed () {
                return this.rowData[this.rowField.isConfirmedKey || 'isConfirmed']
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
