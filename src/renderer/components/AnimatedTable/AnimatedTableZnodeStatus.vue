<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-znode-status"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-znode-status"
    >
        <znode-status :status="rowData.status" />
    </td>
</template>

<script>
import ZnodeStatus from 'renderer/components/ZnodePage/ZnodeStatus'
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'AnimatedTableZnodeStatus',
    components: {
        ZnodeStatus
    },

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped>

</style>
