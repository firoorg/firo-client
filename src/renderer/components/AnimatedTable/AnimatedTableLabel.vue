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

<style scoped>
.payment-request-label, .mint-label {
    color: gray;
}
</style>