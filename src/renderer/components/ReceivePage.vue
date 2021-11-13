<template>
    <div class="receive-page">
        <div class="top">
            <div class="left">
                <div class="title">
                    Scan this QR code to receive Firo
                </div>

                <div class="regular-or-rap">
                    <div class="radio-field">
                        <input type="radio" v-model="useRap" :value="false" />
                        <label>Regular Address</label>
                    </div>

                    <div class="radio-field">
                        <input type="radio" v-model="useRap" :value="true" />
                        <label>RAP Address</label>
                    </div>
                </div>

                <div class="receiving-address">
                    <InputFrame label="Receiving Address">
                        <input id="receive-address" type="text" disabled="true" :value="address" />
                    </InputFrame>

                    <CopyAddressIcon :address="address" />
                    <RefreshAddressIcon :onclick="createNewAddress" />
                </div>

                <InputFrame label="Label">
                    <input id="receive-address-label" type="text" placeholder="Unlabelled" v-model.lazy="label" />
                </InputFrame>

                <div class="rap-guidance">
                    RAP Addresses provide additional privacy when receiving FIRO as these addresses cannot be looked up
                    on a blockchain explorer.
                </div>
            </div>

            <div class="qr-code-container">
                <div ref="qrCode" class="qr-code" />
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
import InputFrame from "renderer/components/shared/InputFrame";
import RefreshAddressIcon from "renderer/components/Icons/RefreshAddressIcon";
import CopyAddressIcon from "renderer/components/Icons/CopyAddressIcon";

const FiroSymbol = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNC4yLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCA1MjAgNTIwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MjAgNTIwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDojRkVGRUZFO30NCgkuc3Qxe2ZpbGw6IzlCMUMyRTt9DQo8L3N0eWxlPg0KPGc+DQoJPGc+DQoJCTxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjI2MCIgY3k9IjI2MCIgcj0iMjUyLjciLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNTUuNiwzNzAuN2M1LjksMCwxMS4yLTMuMiwxNC04LjRsMzcuMy03MC42aC01Ny41Yy04LjcsMC0xNS44LTcuMS0xNS44LTE1Ljh2LTMxLjYNCgkJCWMwLTguNyw3LjEtMTUuOCwxNS44LTE1LjhoOTAuOWw3MC42LTEzMy45YzIuNy01LjIsOC4xLTguNCwxNC04LjRoMTE4LjhDMzk3LjUsMzcuNCwzMzIuMyw3LDI2MCw3QzEyMC4zLDcsNywxMjAuMyw3LDI2MA0KCQkJYzAsMzkuNyw5LjIsNzcuMywyNS41LDExMC43SDE1NS42eiIvPg0KCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMzY0LjQsMTQ5LjNjLTUuOSwwLTExLjIsMy4yLTE0LDguNGwtMzcuMyw3MC42aDU3LjVjOC43LDAsMTUuOCw3LjEsMTUuOCwxNS44djMxLjYNCgkJCWMwLDguNy03LjEsMTUuOC0xNS44LDE1LjhoLTkwLjlsLTcwLjYsMTMzLjljLTIuNyw1LjItOC4xLDguNC0xNCw4LjRINzYuNEMxMjIuNSw0ODIuNiwxODcuNyw1MTMsMjYwLDUxMw0KCQkJYzEzOS43LDAsMjUzLTExMy4zLDI1My0yNTNjMC0zOS43LTkuMi03Ny4zLTI1LjUtMTEwLjdIMzY0LjR6Ii8+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo=";

export default {
    name: "ReceivePage",

    components: {
        InputFrame,
        CopyAddressIcon,
        RefreshAddressIcon,
        AnimatedTable
    },

    data() {
        return {
            address: ($store.getters['AddressBook/receiveAddresses'][0] || {address: null}).address,
            qrCode: null,
            isDefaultAddress: true,
            useRap: false,

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

    destroyed() {
        this.qrCode.clear();
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
                        colorLight: '#EBF0F5'
                    });
                }
            }
        }
    },

    methods: {
        ...mapMutations({
            setAddressBook: 'AddressBook/setAddressBook'
        }),

        copyAddress() {
            clipboard.writeText(this.address);
        },

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
            this.address = addressBook
                .filter(a => a.purpose === 'receive')
                .sort((a, b) => b.createdAt - a.createdAt)[0].address;
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

        .left {
            flex-grow: 1;

            .title, .regular-or-rap {
                vertical-align: center;
                margin-bottom: var(--padding-base);
                font: {
                    weight: bold;
                    size: 14px;
                }
            }

            .regular-or-rap {
                .radio-field {
                    display: inline-block;

                    &:not(:first-child) {
                        margin-left: var(--padding-base);
                    }
                }
            }

            .framed-input, .rap-guidance {
                width: 580px;
            }

            .rap-guidance {
                font-weight: bold;
                margin-top: var(--padding-base);
                text-align: center;
            }

            .receiving-address {
                .framed-input {
                    display: inline-block;
                }

                svg {
                    cursor: pointer;
                    display: inline-block;
                    margin: {
                        left: var(--padding-base);
                        top: 14px;
                        bottom: 14px;
                    }
                }
            }
        }

        .qr-code-container {
            // These need to be specified explicitly so the generation of the QR code doesn't mess up our layout.
            height: calc(200px + var(--padding-base) * 2);
            width: calc(200px + var(--padding-base) * 2);

            margin: var(--padding-base);
            padding: var(--padding-base);
            border-radius: var(--padding-base);
            background-color: #EBF0F5;

            .qr-code {
                width: 200px;
                height: 200px;
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