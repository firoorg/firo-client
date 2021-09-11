<template>
    <div class="receive-page">
        <div class="top">
            <div ref="qrCode" class="qr-code" />

            <div class="right">
                <div class="title">
                    Scan this QR code to receive Firo
                </div>

                <InputFrame label="Receiving Address" :copy="true">
                    <input id="receive-address" type="text" disabled="true" :value="address" />
                </InputFrame>

                <InputFrame label="Label">
                    <input id="receive-address-label" type="text" placeholder="Unlabelled" v-model.lazy="label" />
                </InputFrame>

                <div id="create-new-address-button" class="checkbox-field" @click="createNewAddress">
                    <PlusButton />
                    <label>Create a new address</label>
                </div>
            </div>
        </div>

        <div class="bottom">
            <AnimatedTable
                ref="animatedTable"
                :fields="tableFields"
                :data="tableData"
                :on-row-select="navigateToAddressBookItem"
                :compare-elements="(a, b) => a.address === b.address"
                track-by="address"
                no-data-message="No Saved Addresses"
            />
        </div>
    </div>
</template>

<script>
import {clipboard} from "electron";
import {mapGetters, mapMutations} from "vuex";
import QRCode from "easyqrcodejs";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable";
import AddressBookItemLabel from "renderer/components/AnimatedTable/AddressBookItemLabel";
import AddressBookItemAddress from "renderer/components/AnimatedTable/AddressBookItemAddress";
import CurrentAddressIndicator from "renderer/components/AnimatedTable/CurrentAddressIndicator";
import Copyable from "renderer/components/shared/Copyable";
import InputFrame from "renderer/components/shared/InputFrame";
import PlusButton from "renderer/components/shared/PlusButton";
import {cloneDeep, fromPairs} from "lodash";

const FiroSymbol = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNC4yLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCA1MjAgNTIwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MjAgNTIwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDojRkVGRUZFO30NCgkuc3Qxe2ZpbGw6IzlCMUMyRTt9DQo8L3N0eWxlPg0KPGc+DQoJPGc+DQoJCTxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjI2MCIgY3k9IjI2MCIgcj0iMjUyLjciLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNTUuNiwzNzAuN2M1LjksMCwxMS4yLTMuMiwxNC04LjRsMzcuMy03MC42aC01Ny41Yy04LjcsMC0xNS44LTcuMS0xNS44LTE1Ljh2LTMxLjYNCgkJCWMwLTguNyw3LjEtMTUuOCwxNS44LTE1LjhoOTAuOWw3MC42LTEzMy45YzIuNy01LjIsOC4xLTguNCwxNC04LjRoMTE4LjhDMzk3LjUsMzcuNCwzMzIuMyw3LDI2MCw3QzEyMC4zLDcsNywxMjAuMyw3LDI2MA0KCQkJYzAsMzkuNyw5LjIsNzcuMywyNS41LDExMC43SDE1NS42eiIvPg0KCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMzY0LjQsMTQ5LjNjLTUuOSwwLTExLjIsMy4yLTE0LDguNGwtMzcuMyw3MC42aDU3LjVjOC43LDAsMTUuOCw3LjEsMTUuOCwxNS44djMxLjYNCgkJCWMwLDguNy03LjEsMTUuOC0xNS44LDE1LjhoLTkwLjlsLTcwLjYsMTMzLjljLTIuNyw1LjItOC4xLDguNC0xNCw4LjRINzYuNEMxMjIuNSw0ODIuNiwxODcuNyw1MTMsMjYwLDUxMw0KCQkJYzEzOS43LDAsMjUzLTExMy4zLDI1My0yNTNjMC0zOS43LTkuMi03Ny4zLTI1LjUtMTEwLjdIMzY0LjR6Ii8+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo=";

export default {
    name: "ReceivePage",

    components: {
        PlusButton,
        InputFrame,
        AnimatedTable
    },

    data() {
        return {
            address: ($store.getters['AddressBook/receiveAddresses'][0] || {address: null}).address,
            qrCode: null,
            isDefaultAddress: true,

            tableFields: [
                {name: CurrentAddressIndicator},
                {name: AddressBookItemLabel},
                {name: AddressBookItemAddress}
            ]
        };
    },

    computed: {
        ...mapGetters({
            addressBook: 'AddressBook/addressBook',
            receiveAddresses: 'AddressBook/receiveAddresses',
            txos: 'Transactions/TXOs',
        }),

        label: {
            get() {
                return (this.addressBook[this.address] || {label: ''}).label;
            },

            async set(newLabel) {
                if (!this.address) return;
                if (newLabel) {
                    this.isDefaultAddress = false;

                    await $daemon.updateAddressBookItem(this.addressBook[this.address], newLabel);
                    this.setAddressBook(await $daemon.readAddressBook());
                }
            }
        },

        tableData() {
            this.$nextTick(() => this.$refs.animatedTable.reload());
            return this.receiveAddresses.map(addr => ({isSelected: addr.address === this.address, ...addr}));
        }
    },

    // Make sure we always display a fresh address.
    watch: {
        // When we receive transactions to the default address, we need to add it to the list of old addresses and show
        // a new default address.
        //
        // This is a stopgap measure until we can add functionality in firod to send us the address book in proper
        // events. This is the only page on which the list of receive addresses can be viewed, so the effect is the
        // same.
        txos: {
            immediate: true,
            async handler() {
                // Don't throw errors during reload.
                while (!window.$daemon) {
                    await new Promise(r => setTimeout(r, 100));
                }

                if (!this.address || (this.isDefaultAddress && this.txos.find(txo => txo.destination === this.address))) {
                    await this.createNewAddress(true);
                }
            }
        },

        // Update the QR code
        address: {
            immediate: true,
            async handler() {
                if (!this.address) return;

                // Don't throw errors during reload.
                while (!this.$refs.qrCode) {
                    await new Promise(r => setTimeout(r, 100));
                }

                if (this.qrCode) {
                    this.qrCode.makeCode(this.address)
                } else {
                    this.qrCode = new QRCode(this.$refs.qrCode, {
                        text: this.address,
                        height: 200,
                        width: 200,
                        colorDark: 'black',
                        colorLight: 'white',
                        logo: FiroSymbol,
                        logoBackgroundColor: 'white'
                    });
                }
            }
        }
    },

    methods: {
        ...mapMutations({
            setAddressBook: 'AddressBook/setAddressBook'
        }),

        async createNewAddress() {
            const address = await $daemon.getUnusedAddress();

            await $daemon.addAddressBookItem({
                address,
                label: '',
                purpose: 'receive'
            });
            const addressBook = await $daemon.readAddressBook();
            this.setAddressBook(addressBook);

            this.label = '';
            this.isDefaultAddress = true;
            // We have to replicated the sorting of this.receiveAddresses here due to timing issues. $nextTick doesn't
            // work either. :(
            this.address = addressBook.sort((a, b) => b.createdAt - a.createdAt)[0].address;
        },

        navigateToAddressBookItem(item) {
            this.isDefaultAddress = false;
            this.address = item.address;
        }
    }
}
</script>

<style scoped lang="scss">
.receive-page {
    height: 100%;
    padding: var(--padding-base);
    display: flex;
    flex-direction: column;

    .top {
        display: flex;
        margin-bottom: var(--padding-base);

        .qr-code {
            width: 200px;
            height: 200px;
            margin-right: var(--padding-base);
        }

        .right {
            flex-grow: 1;

            .title {
                margin-bottom: var(--padding-base);
                font: {
                    weight: bold;
                    size: 14px;
                }
            }

            .framed-input {
                width: 420px;
            }

            #create-new-address-button {
                &, label { cursor: pointer; }
                color: var(--color-secondary);
                font-weight: bold;
            }
        }
    }

    .bottom {
        flex-grow: 1;

        .animated-table {
            height: 100%;
        }
    }
}
</style>