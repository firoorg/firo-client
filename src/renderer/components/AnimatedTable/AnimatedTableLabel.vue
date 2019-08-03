<template>
    <th
        v-if="isHeader"
        @click="$emit('click', rowField, $event)"
    >
        Label
    </th>

    <td
        v-else
        :class="`${paymentType}-label`"
    >
        <span
            v-if="paymentType === 'payment-request'"
            class="payment-request-warning"
        >
            Payment Request:
        </span>

        {{ label }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "AnimatedTableLabel",

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        paymentType () {
            return this.rowData.paymentType;
        },

        label () {
            return this.rowData.label;
        }
    }
}
</script>

<style scoped lang="scss">
.payment-request-label {
    color: gray;

    .payment-request-warning {
        font-style: italic;
    }
}

.mint-label {
    font-style: italic;
}
</style>