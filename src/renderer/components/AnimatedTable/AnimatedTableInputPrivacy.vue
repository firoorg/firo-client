<template>
    <th v-if="isHeader">
        Type
    </th>
    
    <td v-else class="input-privacy">
        <div class="inner-input-privacy">
            {{ rowData.inputPrivacy }}
        </div>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "AnimatedTableInputPrivacy",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
td.input-privacy {
    width: 180px;
    max-width: 180px;

    .inner-input-privacy {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 5px;
    }
}
</style>
