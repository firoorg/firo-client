<template>
    <th v-if="isHeader"
        class="vuetable-th-component-label-with-hashtags"
        v-html="title"
        @click="$emit('click', rowField, $event)"
    ></th>
    <td v-else
        class="vuetable-td-component-label-with-hashtags"
    >
        <natural-language-tags :content="rowData[rowField.contentField]" />
    </td>
</template>

<script>
    import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'
    import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'

    export default {
        name: 'AnimatedTableLabelWithHashTags',
        components: {
            NaturalLanguageTags
        },
        mixins: [
            VuetableFieldMixin
        ]
    }
</script>

<style scoped>

</style>