<template>
    <th v-if="isHeader"
        class="vuetable-th-component-relative-date"
        v-html="title"
    ></th>
    <td v-else
        class="vuetable-td-component-relative-date"
    >
        <timeago :since="relativeDate" :auto-update="30"></timeago>
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