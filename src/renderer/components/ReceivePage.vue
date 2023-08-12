<template>
    <div class="receive-page">
        <div class="top">
            <div class="left">
                <div class="grid">
                    <InputFrame label="Receiving Address">
                        <input id="receive-address" type="text" :disabled="true" :value="address" />
                    </InputFrame>

                    <div class="icons">
                        <CopyAddressIcon :address='address' />
                        <RefreshAddressIcon :onclick='refreshAddress' />
                    </div>

                    <InputFrame label='Label'>
                        <input ref='label' id='receive-address-label' type='text' placeholder='Unlabelled'
                               v-model='label' @change='changeLabel' />
                    </InputFrame>

                    <InputFrame v-if='isSparkAllowed' label='Address Type'>
                        <Dropdown :options='addressOptions' v-model='addressType' />
                    </InputFrame>
                </div>
            </div>

            <div class="qr-code-container" :class="{'no-display': !address}">
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
import {markRaw} from "vue";
import {clipboard} from "electron";
import {mapGetters, mapMutations} from "vuex";
import QRCode from "easyqrcodejs";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable.vue";
import AddressBookItemLabel from "renderer/components/AnimatedTable/AddressBookItemLabel.vue";
import AddressBookItemAddress from "renderer/components/AnimatedTable/AddressBookItemAddress.vue";
import CurrentAddressIndicator from "renderer/components/AnimatedTable/CurrentAddressIndicator.vue";
import InputFrame from "renderer/components/shared/InputFrame.vue";
import RefreshAddressIcon from "renderer/components/Icons/RefreshAddressIcon.vue";
import CopyAddressIcon from "renderer/components/Icons/CopyAddressIcon.vue";
import Popup from "renderer/components/shared/Popup.vue";
import Dropdown from './shared/Dropdown.vue';

export default {
    name: "ReceivePage",

    components: {
        Dropdown,
        InputFrame,
        CopyAddressIcon,
        RefreshAddressIcon,
        AnimatedTable,
        Popup
    },

    data() {
        const addressType = this.isSparkAllowed ? 'Spark' : 'Transparent';
        return {
            address: $store.getters['AddressBook/receiveAddresses'].filter(a => a.addressType === addressType)[0]?.address,
            label: '',
            _quickLabel: null,
            qrCode: null,
            isDefaultAddress: true,
            show: '',
            error: '',
            passphrase: '',
            addressType,

            addressOptions: [
                {id: 'Spark', name: 'Spark'},
                {id: 'Transparent', name: 'Transparent'}
            ],

            tableFields: [
                {name: markRaw(CurrentAddressIndicator)},
                {name: markRaw(AddressBookItemLabel)},
                {name: markRaw(AddressBookItemAddress)}
            ]
        };
    },

    computed: {
        ...mapGetters({
            addressBook: 'AddressBook/addressBook',
            receiveAddresses: 'AddressBook/receiveAddresses',
            txos: 'Transactions/TXOs',
            isSparkAllowed: 'ApiStatus/isSparkAllowed'
        }),

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
                    await this.refreshAddress(true);
                }
            }
        },

        // Update the QR code
        address: {
            immediate: true,
            async handler() {
                if (!this.address) return;

                this.label = this.addressBook[this.address]?.label || this._quickLabel || '';
                this._quickLabel = null;

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
                        colorLight: '#EBF0F5',
                        drawer: 'svg'
                    });
                }

                const img = document?.querySelector('.qr-code img');
                if (img) img.style = 'width: 200px; height: 200px';
            }
        },

        addressType() {
            this.address = $store.getters['AddressBook/receiveAddresses'].filter(a => a.addressType === this.addressType)[0]?.address;
        }
    },

    methods: {
        ...mapMutations({
            setAddressBook: 'AddressBook/setAddressBook'
        }),

        async changeLabel(ev) {
            if (!this.address) return;

            if (this.label && this.label !== this.addressBook[this.address].label) {
                this.isDefaultAddress = false;

                await $daemon.updateAddressBookItem(this.addressBook[this.address], this.label);
                this.setAddressBook(await $daemon.readAddressBook());
            }
        },

        copyAddress() {
            clipboard.writeText(this.address);
        },

        async refreshAddress() {
            const address = await $daemon.getUnusedAddress(this.addressType);

            await $daemon.addAddressBookItem({
                addressType: this.addressType,
                address,
                label: '',
                purpose: 'receive'
            });
            const addressBook = await $daemon.readAddressBook();
            this.setAddressBook(addressBook);

            this.label = '';
            this.isDefaultAddress = true;
            // We have to replicate the sorting of this.receiveAddresses here due to timing issues. $nextTick doesn't
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

            $input-right-space: 100px;
            $input-right-space-interior: calc(#{$input-right-space} - 4px - var(--padding-base));

            .grid {
                margin: {
                    right: var(--padding-base);
                    top: var(--padding-base);
                }

                display: grid;
                grid: 80% 20% / 80% 20%;
                grid-column-gap: var(--padding-base);

                .icons {
                    margin-top: var(--padding-base);
                    text-align: right;

                    *:last-child {
                        margin-left: var(--padding-base);
                    }
                }
            }

            .framed-input {
                display: inline-block;
            }

            .icons * {
                cursor: pointer;
            }

            .receiving-address {
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

            &.no-display {
                opacity: 0;
            }

            .qr-code {
                width: 200px;
                height: 200px;
            }
        }
    }

    .bottom {
        flex-grow: 1;

        td.address, th.address {
            width: 100px;
            color: red;
        }

        .animated-table {
            height: 100%;
        }
    }
}
</style>