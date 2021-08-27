<template>
    <div class="receive-page">
        <div class="top">
            <div ref="qrCode" class="qr-code" />

            <div class="right">
                <div class="title">
                    Scan this QR code to receive Firo
                </div>

                <InputFrame label="Receiving Address">
                    <input id="receive-address" type="text" disabled="true" :value="address" />
                </InputFrame>

                <InputFrame label="Label">
                    <input type="text" placeholder="Unlabelled" v-model.lazy="label" />
                </InputFrame>

                <div class="checkbox-field create-new-address" @click="createNewAddress">
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
            address: null,
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
            addresses: 'Transactions/addresses',
            transactions: 'Transactions/transactions',
            _cachedAddress: 'App/cachedAddress'
        }),

        cachedAddress: {
            get() {
                return this._cachedAddress;
            },

            set(value) {
                this.$store.commit('App/setCachedAddress', value);
            }
        },

        label: {
            get() {
                return (this.addressBook[this.address] && this.addressBook[this.address].label) || '';
            },

            async set(newLabel) {
                if (!this.address) return;
                if (newLabel) {
                    const newAddress = await $daemon.updateAddressBookItem(this.addressBook[this.address], newLabel);
                    this.isDefaultAddress = false;
                    await this.$store.commit('AddressBook/updateAddress', newAddress);
                }
            }
        },

        tableData() {
            this.$nextTick(() => this.$refs.animatedTable.reload());
            return this.receiveAddresses.map(addr => ({isSelected: addr.address === this.address, ...addr}));
        }
    },

    async mounted() {
        // Make sure everything shows properly on reload.
        while (!window.$daemon) {
            await new Promise(r => setTimeout(r, 10));
        }

        if (this.cachedAddress) {
            this.address = this.cachedAddress;
            this.makeQrCode();
        }

        const newAddress = await $daemon.getUnusedAddress();
        if (this.address != newAddress) {
            this.address = newAddress;
            this.cachedAddress = this.address;
            await this.displayAddress();
        }
    },

    // Make sure we always display a fresh address.
    watch: {
        async addresses() {
            if (this.isDefaultAddress && this.addresses[this.address]) {
                this.address = await $daemon.getUnusedAddress();
                this.cachedAddress = this.address;
                await this.displayAddress();
            }
        },

        // When we receive transactions to the default address, we need to add it to the list of old addresses and show
        // a new default address.
        //
        // This is a stopgap measure until we can add functionality in firod to send us the address book in proper
        // events. This is the only page on which the list of receive addresses can be viewed, so the effect is the
        // same.
        transactions: {
            immediate: true,
            async handler() {
                // Don't throw errors during reload.
                while (!window.$daemon) {
                    await new Promise(r => setTimeout(r, 100));
                }

                this.setAddressBook(await $daemon.readAddressBook());
                // The displayed address and QR code will be updated in the addresses watcher.
            }
        }
    },

    methods: {
        ...mapMutations({
            setAddressBook: 'AddressBook/setAddressBook'
        }),

        async createNewAddress() {
            if (!this.address) return;

            let unusedAddress = await $daemon.getUnusedAddress();
            if (this.isDefaultAddress) {
                const newAddress = await $daemon.updateAddressBookItem(this.addressBook[this.address], '');
                await this.$store.commit('AddressBook/updateAddress', newAddress);
                unusedAddress = await $daemon.getUnusedAddress();
            } else if (this.addressBook[unusedAddress]) {
                const newAddress = await $daemon.updateAddressBookItem(this.addressBook[unusedAddress], '');
                await this.$store.commit('AddressBook/updateAddress', newAddress);
                unusedAddress = await $daemon.getUnusedAddress();
            }

            this.isDefaultAddress = true;
            this.label = '';
            this.address = unusedAddress;
            this.setAddressBook(await $daemon.readAddressBook());
            this.$nextTick(async () => {
                await this.displayAddress();
                this.$refs.animatedTable.refresh();
            });
        },

        navigateToAddressBookItem(item) {
            this.isDefaultAddress = false;
            this.address = item.address;
            this.displayAddress();
        },

        async displayAddress() {
            if (!this.address) {
                this.address = await $daemon.getUnusedAddress();
                this.cachedAddress = this.address;
            }

            // Don't throw errors during reload.
            while (!this.$refs.qrCode) {
                await new Promise(r => setTimeout(r, 100));
            }

            this.makeQrCode();
        },

        makeQrCode() {
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

            .create-new-address {
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