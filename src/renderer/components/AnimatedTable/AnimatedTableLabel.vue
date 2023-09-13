<template>
    <th
        v-if="isHeader"
        @click="$emit('click', rowField, $event)"
    >
        Label
    </th>

    <td v-else ref="outer" class="outer-label">
        <div class="label-text">
            {{ label }}
        </div>
    </td>
</template>

<script>
// The default values here should be coordinated with the assignment of extraSearchText in PaymentsList.

import VuetableFieldMixin from 'vue3-vuetable/src/components/VuetableFieldMixin.vue';
import {mapGetters} from "vuex";

export default {
    name: "AnimatedTableLabel",

    mixins: [
        VuetableFieldMixin
    ],

    data() {
        return {
            eventListener: null
        };
    },

    computed: {
        ...mapGetters({
            addressBook: 'AddressBook/addressBook'
        }),

        label () {
            if (this.rowData.label) return this.rowData.label;
            const address = this.rowData.elysium ? this.rowData.elysium.receiver || this.rowData.elysium.sender : this.rowData.address;
            if (this.addressBook[address] && this.addressBook[address].label) return this.addressBook[address].label;
            if (!address) return "Unknown Address";
            return address;
        }
    },

    methods: {
        setOuterWidth() {
            this.$refs.outer?.style.setProperty('--outer-width', `${this.$refs.outer.clientWidth}px`);
        }
    },

    mounted() {
        this.setOuterWidth();
        // this is used to overcome slow calculation of the width of the element; $nextTick is not enough
        setTimeout(this.setOuterWidth, 500);
        this.eventListener = window.addEventListener('resize', this.setOuterWidth);
    },

    unmounted() {
        window.removeEventListener('resize', this.eventListener);
    }
}
</script>

<style scoped lang="scss">
.outer-label {
    --outer-width: 1px;

    .label-text {
        max-width: calc(var(--outer-width) - 40px);
        text-overflow: ellipsis;
        overflow: hidden;
    }
}
</style>
