<template>
    <th v-if="isHeader" class="vuetable-th-component-status" @click="$emit('click', rowField, $event)">Status</th>

    <td v-else class="vuetable-td-component-coinswap-status" :title="rowData.status">
        <div v-if="rowData.status === 'expired'">
            &#xef1b;
        </div>

        <div v-else-if="rowData.status === 'failed' || rowData.status === 'overdue'">
            &#xef1b;
        </div>

        <div v-else-if="rowData.status === 'waiting' || rowData.status === 'wait'">
            <div class="spin">&#xeffa;</div>
        </div>

        <div v-else-if="rowData.status === 'received' || rowData.status === 'confirming' || rowData.status === 'confirmation' || rowData.status === 'exchanging' || rowData.status === 'sending' ">
            <div class="spin">&#xe819;</div>
        </div>

        <div v-else-if="rowData.status === 'confirmed' || rowData.status === 'finished' || rowData.status === 'success'">
            &#xeed6;
        </div>

        <div v-else>
            ?
        </div>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue'

export default {
    name: 'CoinSwapSentAmount',

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
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

td {
    font-family: "IcoFont";
}
</style>
