<template>
    <th v-if="isHeader" class="address">
        Address
    </th>

    <td v-else ref="outer" class="address">
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
    ],

    data() {
        return {
            eventListener: null
        };
    },

    methods: {
        setOuterWidth() {
            this.$refs.outer?.style.setProperty('--outer-width', `${this.$refs.outer.clientWidth}px`);
        }
    },

    mounted() {
        this.setOuterWidth();
        // this is used to overcome slow calculation of the width of the element; $nextTick is not enough\
        setTimeout(this.setOuterWidth, 500);
        this.eventListener = window.addEventListener('resize', this.setOuterWidth);
    },

    unmounted() {
        window.removeEventListener('resize', this.eventListener);
    }
}
</script>

<style scoped lang="scss">
.address {
    --outer-width: 1px;

    .inner {
        max-width: calc(var(--outer-width) - 40px);
        text-overflow: ellipsis;
        overflow: hidden;
    }
}
</style>