<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-amount"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-amount"
    >
        <span class="amount">
            {{ amountReceived }}
        </span>
        /
        <span class="amount-requested">
            {{ amountRequested }}
        </span>
    </td>
</template>

<script>
import { convertToCoin } from '#/lib/convert'
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'AnimatedTableReceivedAmount',
    mixins: [
        VuetableFieldMixin
    ],
    computed: {
        amountReceived () {
            return this.rowData.amountReceived > 0 ? convertToCoin(this.rowData.amountReceived) : '~'
        },
        amountRequested () {
            return this.rowData.amountRequested > 0 ? convertToCoin(this.rowData.amountRequested) : '~'
        }
    }
}
</script>

<style scoped>

</style>
