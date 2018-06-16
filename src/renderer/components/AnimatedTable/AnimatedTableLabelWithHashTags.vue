<template>
    <th v-if="isHeader"
        class="vuetable-th-component-label-with-hashtags"
        v-html="title"
    ></th>
    <td v-else
        class="vuetable-td-component-label-with-hashtags"
    >
        {{ rowData.label }}
    </td>
</template>

<script>
    import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

    export default {
        name: 'AnimatedTableRelativeDate',
        mixins: [
            VuetableFieldMixin
        ]
    }
</script>

<style scoped>

</style>