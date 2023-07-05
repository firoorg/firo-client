<template>
    <th v-if="isHeader">ID</th>
    <td v-else-if="rowData.id" class="elysium-id">{{ rowData.id }}</td>
    <td v-else class="elysium-id waiting"><div class="spin">&#xeffa;</div></td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "ElysiumTokenId",

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
    font-family: "IcoFont";
    width: fit-content;
    animation: {
        name: spin;
        duration: 10s;
        timing-function: linear;
        iteration-count: infinite;
    }
}
</style>