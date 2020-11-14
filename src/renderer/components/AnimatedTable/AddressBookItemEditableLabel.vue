<template>
    <th v-if="isHeader">
        Label
    </th>

    <td v-else class="label">
        <div v-if="isEditing">
            <input v-model="label" @keyup.enter="changeLabel" @focusout="changeLabel" />
        </div>

        <div v-else>
            <a href="#" @click="isEditing=true">
                {{ label || 'Unlabelled' }}
            </a>
        </div>
    </td>
</template>

<script>
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue';

export default {
    name: "PaymentRequestLabel",

    mixins: [
        VuetableFieldMixin
    ],

    data() {
        return {
            label: '',
            isEditing: false
        };
    },

    watch: {
        rowData: {
            immediate: true,
            handler(rowData) {
                if (!rowData) return;
                this.label = rowData.label;
            }
        }
    },

    methods: {
        async changeLabel() {
            const rowData = this.rowData;

            if (rowData.label === this.label) {
                this.isEditing = false;
                return;
            }

            try {
                const newABI = await $daemon.updateAddressBookItem(rowData, this.label);
                $store.commit('AddressBook/updateAddress', newABI);
            } finally {
                this.isEditing = false;
            }
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";
@import "src/renderer/styles/inputs";
@import "src/renderer/styles/sizes";

td {
    @include label();
}

input {
    @include input-field;
    height: calc(#{$size-table-row-height} - #{$size-table-row-vertical-padding} * 2);
    width: calc(100% - #{$size-table-row-horizontal-padding});
}
</style>
