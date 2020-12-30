<template>
    <th v-if="isHeader" class="vuetable-th-component-address" @click="$emit('click', rowField, $event)">
        Address
    </th>

    <td v-else class="vuetable-td-component-coinswap-address">
        {{ address }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'CoinSwapSentAmount',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        address() {
            if (this.rowData.fromCoin === 'FIRO') return this.rowData.receiveAddress;
            else return this.rowData.exchangeAddress;
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/typography";

.vuetable-td-component-coinswap-address {
    @include monospace();
    @include mini();
}
</style>
