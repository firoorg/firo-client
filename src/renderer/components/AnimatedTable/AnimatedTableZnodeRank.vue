<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-rank"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-rank"
    >
        <span v-if="rank">
            {{ rank }}
        </span>
        <span v-else>
            –
        </span>
    </td>
</template>

<script>
import { convertToCoin } from 'lib/convert'
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'AnimatedTableZnodeRank',
    mixins: [
        VuetableFieldMixin
    ],
    computed: {
        rank () {
            return this.rowData.rank
        }
    }
}
</script>

<style lang="scss" scoped>
    td {
    }
</style>
