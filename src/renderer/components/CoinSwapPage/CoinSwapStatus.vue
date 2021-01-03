<template>
    <th v-if="isHeader" class="vuetable-th-component-status" @click="$emit('click', rowField, $event)">
    </th>

    <td v-else class="vuetable-td-component-coinswap-status ico-font" :title="rowData.status">
        <div v-if="rowData.status === 'expired'">
            &#xef1b;
        </div>

        <div v-else-if="rowData.status === 'failed'">
            &#xef1b;
        </div>

        <div v-else-if="rowData.status === 'waiting'">
            <div class="spin">&#xeffa;</div>
        </div>

        <div v-else-if="rowData.status === 'received'">
            <div class="spin">&#xe819;</div>
        </div>

        <div v-else-if="rowData.status === 'exchanging'">
            <div class="spin">&#xe819;</div>
        </div>

        <div v-else-if="rowData.status === 'confirming'">
            <div class="spin">&#xe819;</div>
        </div>

        <div v-else-if="rowData.status === 'confirmed'">
            &#xeed6;
        </div>

        <div v-else>
            ?
        </div>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'
import ExpiredIcon from 'renderer/assets/ExpiredIcon.svg'

export default {
    name: 'CoinSwapSentAmount',

    mixins: [
        VuetableFieldMixin
    ],

    components: {
        ExpiredIcon
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.spin {
    width: fit-content;
    animation: {
        name: spin;
        duration: 10s;
        timing-function: linear;
        iteration-count: infinite;
    }
}
</style>
