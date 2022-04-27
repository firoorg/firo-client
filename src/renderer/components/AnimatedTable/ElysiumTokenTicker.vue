<template>
    <th v-if="isHeader">Ticker</th>
    <td v-else class="elysium-ticker">{{ rowData.ticker }}</td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "ElysiumTokenTicker",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>