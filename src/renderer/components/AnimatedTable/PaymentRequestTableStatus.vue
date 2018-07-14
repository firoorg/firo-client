<template>
    <th v-if="isHeader"
        class="vuetable-th-component-relative-date"
        v-html="title"
        @click="$emit('click', rowField, $event)"
    ></th>
    <td v-else
        class="vuetable-td-component-relative-date"
    >
        <payment-request-status :is-fulfilled="isFulfilled" class="icon" />
    </td>
</template>

<script>
    import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'
    import PaymentRequestStatus from '@/components/Icons/PaymentRequestStatus'

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
                return this.rowData.isFulfilled
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