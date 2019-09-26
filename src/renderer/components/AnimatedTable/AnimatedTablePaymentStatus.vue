<template>
    <th
        v-if="isHeader"
        class="vuetable-th-component-transaction-status"
        @click="$emit('click', rowField, $event)"
        v-html="title"
    />
    <td
        v-else
        class="vuetable-td-component-transaction-status"
        :title="`${confirmations} confirmations`"
        :class="{'is-confirmed': confirmations >= 1}"
        @contextmenu="contextMenu"
    >
        <span
            v-if="['spendIn', 'receive', 'mined', 'znode'].includes(category)"
            class="ok is-incoming"
        >
            ⬇
        </span>
        <span
            v-else-if="['spendOut', 'send'].includes(category)"
            class="ok is-outgoing"
        >
            ⬆
        </span>
        <span
            v-else-if="category === 'mint'"
            class="ok is-mint"
        >
            ⓩ
        </span>
        <span
            v-else-if="category === 'payment-request'"
            class="is-payment-request"
        >
            …
        </span>
        <span
            v-else
            class="error"
        >
            ❗
        </span>
    </td>
</template>

<script>
import { mapGetters } from 'vuex';
import VuetableFieldMixin from 'vuetable-2/src/components/VuetableFieldMixin.vue'

const remote = require('electron').remote;
const {Menu, MenuItem} = remote;

const menu = new Menu();
const menuItem = new MenuItem({
    label: 'Inspect Element',
    click: () => {
        remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
    }
});

export default {
    name: 'TransactionStatus',

    mixins: [
        VuetableFieldMixin
    ],

    computed: {
        ...mapGetters({
            currentBlockHeight: 'Blockchain/currentBlockHeight'
        }),

        category () {
            return this.rowData.category;
        },

        confirmations () {
            return (this.rowData.blockHeight || 0) && (1 + this.currentBlockHeight - this.rowData.blockHeight);
        }
    },

    methods: {
        contextMenu () {
            // Only show the menu for outgoing transactions not yet included in a block;
            if (this.rowData.blockHeight || !['send', 'spendOut'].includes(this.rowData.category)) {
                return;
            }

            const menu = new Menu();
            menu.append(new MenuItem({
                label: 'Rebroadcast Transaction',
                click: async () => {
                    try {
                        await this.$daemon.rebroadcast(this.rowData.txid);
                        alert('Rebroadcast tx ' + this.rowData.txid);
                    } catch (e) {
                        alert('Error rebroadcasting tx ' + this.rowData.txid + ': ' + e);
                    }
                }
            }));

            menu.popup({ window: remote.getCurrentWindow() });
        }
    }
}
</script>

<style lang="scss">
    .vuetable-td-component-transaction-status {
        user-select: none;

        &.is-confirmed {
            color: green;
        }

        &:not(.is-confirmed) {
            color: orange;
        }

        .is-outgoing {
            color: red;
        }
    }
</style>