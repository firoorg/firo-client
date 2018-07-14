<template>
    <th v-if="isHeader"
        class="vuetable-th-component-relative-date"
        v-html="title"
        @click="$emit('click', rowField, $event)"
    ></th>
    <td v-else
        class="vuetable-td-component-relative-date"
    >
        <timeago :since="relativeDate"
                 :auto-update="30"
                 :key="rowData.id" />
    </td>
</template>

<script>
    import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

    export default {
        name: 'AnimatedTableRelativeDate',
        mixins: [
            VuetableFieldMixin
        ],

        computed: {
            relativeDate () {
                return this.rowData[this.rowField.dateField]
            }
        }
    }
</script>

<style scoped>

</style>