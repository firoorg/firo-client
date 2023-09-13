<template>
    <th v-if="isHeader">
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
import {mapActions, mapGetters} from "vuex";
import { ipcRenderer } from 'electron';
import EditLabelPopupComponent from 'renderer/components/shared/EditLabelPopup.vue';
import {h, render} from 'vue';

export default {
    name: "AnimatedTableLabel",

    mixins: [
        VuetableFieldMixin
    ],

    data() {
        return {
            contextmenuListener: null,
            resizeListener: null,
            newLabel: this.label,
            show: 'main'
        };
    },

    mounted() {
        if (!this.$refs.outer) return;

        this.setOuterWidth();
        // this is used to overcome slow calculation of the width of the element; $nextTick is not enough
        setTimeout(this.setOuterWidth, 500);
        this.resizeListener = window.addEventListener('resize', this.setOuterWidth);

        this.contextmenuListener = this.$refs.outer.addEventListener('contextmenu', async () => {
            const label = 'Edit Transaction Label';
            const res = await ipcRenderer.invoke('show-context-menu', [label]);
            if (res != label) return;

            this.showEditPopup();
        }, false);
    },

    beforeUnmount() {
        if (!this.$refs.outer) return;

        window.removeEventListener('resize', this.resizeListener)
        this.$refs.outer.removeEventListener('contextmenu', this.contextmenuListener);
        this.closeEditPopup();
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
        },

        showEditPopup() {
            const popup = h(EditLabelPopupComponent, {
                label: this.label,

                cancel: () => {
                    this.closeEditPopup();
                },

                save: async (label) => {
                    if (label != this.label)
                        await $daemon.setTxoLabel([this.rowData.txid, this.rowData.index], label);

                    this.closeEditPopup();
                }
            });
            popup.appContext = this.appContext;

            this.popupContainer = document.createElement('div');
            this.popupContainer.id = 'edit-label-popup';

            document.getElementById('main-layout').appendChild(this.popupContainer);
            render(popup, this.popupContainer);
        },

        closeEditPopup() {
            document.getElementById('edit-label-popup')?.remove();
        }
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
