<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-address"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-address"
    >
        {{ address }}
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

export default {
    name: 'AnimatedTableAddress',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        address () {
            return this.rowData.address
        }
    }
}
</script>

<style scoped>
    .vuetable-td-component-address {
        font-family: monospace;
        font-size: 1.2em;
    }
</style>
