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
        <span
            v-if="paymentType === 'outgoing'"
            class="outgoing"
        >
            -{{ amount }}
        </span>
        <span
            v-else-if="paymentType === 'incoming'"
            class="incoming"
        >
            +{{ amount }}
        </span>
        <span
            v-else-if="paymentType === 'mint'"
            class="mint"
        >
            ({{ amount }})
        </span>
        <span
            v-else-if="paymentType === 'payment-request'"
            class="payment-request"
        >
            ({{ amount }})
        </span>
    </td>
</template>

<script>
import { convertToCoin } from '#/lib/convert'
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'AnimatedTableAmount',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        paymentType () {
            return this.rowData.paymentType;
        },

        amount () {
            return convertToCoin(this.rowData.amount);
        }
    }
}
</script>

<style scoped lang="scss">
.vuetable-td-component-amount {
    font-family: monospace;

    .outgoing {
        color: red;
    }

    .incoming {
        color: green;
    }

    .mint, .payment-request {
        color: grey;
    }
}
</style>
