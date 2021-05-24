<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-amount"
        @click="$emit('click', rowField, $event)"
    >
        Amount
    </th>

    <td
        v-else
        class="vuetable-td-component-amount"
    >
        <span
            v-if="['spendOut', 'send'].includes(category)"
            class="outgoing"
        >
            -{{ amount }} FIRO
        </span>
        <span
            v-else-if="['spendIn', 'receive', 'mined', 'znode', 'mintIn'].includes(category)"
            class="incoming"
        >
            +{{ amount }} FIRO
        </span>
        <span
            v-else-if="category === 'mint'"
            class="mint"
        >
            ({{ amount }} FIRO)
        </span>
        <span
            v-else-if="category === 'payment-request'"
            class="payment-request"
        >
            ({{ amount }} FIRO)
        </span>
        <span v-else>
            This is a bug.
        </span>
    </td>
</template>

<script>
import { convertToCoin } from 'lib/convert'
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'AnimatedTableAmount',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        category () {
            return this.rowData.category;
        },

        amount () {
            return convertToCoin(this.rowData.amount);
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/typography";

.vuetable-td-component-amount {
    .outgoing {
        color: var(--color-amount-negative);
    }

    .incoming {
        color: var(--color-amount-positive);
    }

    .mint, .payment-request {
        color: var(--color-amount-neutral);
    }
}
</style>
