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
        {{ amount }}
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
        amount () {
            return convertToCoin(this.rowData.amount)
        }
    }
}
</script>

<style scoped>

</style>