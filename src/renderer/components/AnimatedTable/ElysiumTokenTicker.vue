<template>
    <th v-if="isHeader">Ticker</th>
    <td v-else class="elysium-ticker">{{ rowData.ticker }}</td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "ElysiumTokenTicker",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
</style>