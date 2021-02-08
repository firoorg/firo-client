<template>
    <th v-if="isHeader">
        Label
    </th>

    <td v-else class="address-book-item-editable-label">
        <div v-if="isEditing">
            <input ref="editLabelInput" v-model="label" @keyup.enter="changeLabel" @blur="onBlur" />
        </div>

        <div v-else>
            <a href="#" @click="beginEditing">
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
        beginEditing() {
            this.isEditing = true;
            this.$nextTick(() => this.$refs.editLabelInput.focus());
        },

        onBlur() {
            // Acting onBlur here messes with Spectron.
            if (process.env.FIRO_CLIENT_TEST) return;
            this.changeLabel();
        },

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
