<template>
    <th v-if="isHeader" class="address">
        Address
    </th>

    <td v-else class="address">
        <div class="inner">
            {{ rowData.address }}
        </div>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';

export default {
    name: "Address",

    mixins: [
        VuetableFieldMixin
    ]
}
</script>

<style scoped lang="scss">
.address .inner {
    max-width: 50vw;
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>