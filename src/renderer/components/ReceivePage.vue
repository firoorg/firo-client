<template>
    <div class="receive-page">
        <div class="top">
            <div ref="outerQrCode" class="outer">
                <div ref="qrContainer" class="qr-container">
                    <div ref="qrContainerInner" class="inner" style="display: none">
                        <div ref="qrCode" class="qr-code" />
                    </div>
                </div>
            </div>

            <div class="address">
                <div v-if="address" class="loading">
                    <div class="label">
                        <input v-if="isEditing" class="label-input" type="text" v-model="label" />
                        <div v-else class="label-text">{{ label }}</div>

                        <input v-if="isEditing" type="button" value="Ok!" @click="changeLabel()" />
                        <input v-else type="button" value="Edit" @click="isEditing = true" />
                    </div>

                    <div class="address">
                        {{ address }}
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom">
            <AnimatedTable
                :fields="tableFields"
                :data="receiveAddresses"
                :on-row-select="navigateToAddressBookItem"
                :compare-elements="(a, b) => a.address === b.address && a.label === b.label"
                track-by="address"
                no-data-message="No Saved Addresses"
            />
        </div>
    </div>
</template>

<script>
import {clipboard} from "electron";
import {mapGetters} from "vuex";
import QRCode from "easyqrcodejs";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable";
import AddressBookItemEditableLabel from "renderer/components/AnimatedTable/AddressBookItemEditableLabel";
import AddressBookItemAddress from "renderer/components/AnimatedTable/AddressBookItemAddress";

const FiroSymbol = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNC4yLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCA1MjAgNTIwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MjAgNTIwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDojRkVGRUZFO30NCgkuc3Qxe2ZpbGw6IzlCMUMyRTt9DQo8L3N0eWxlPg0KPGc+DQoJPGc+DQoJCTxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjI2MCIgY3k9IjI2MCIgcj0iMjUyLjciLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNTUuNiwzNzAuN2M1LjksMCwxMS4yLTMuMiwxNC04LjRsMzcuMy03MC42aC01Ny41Yy04LjcsMC0xNS44LTcuMS0xNS44LTE1Ljh2LTMxLjYNCgkJCWMwLTguNyw3LjEtMTUuOCwxNS44LTE1LjhoOTAuOWw3MC42LTEzMy45YzIuNy01LjIsOC4xLTguNCwxNC04LjRoMTE4LjhDMzk3LjUsMzcuNCwzMzIuMyw3LDI2MCw3QzEyMC4zLDcsNywxMjAuMyw3LDI2MA0KCQkJYzAsMzkuNyw5LjIsNzcuMywyNS41LDExMC43SDE1NS42eiIvPg0KCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMzY0LjQsMTQ5LjNjLTUuOSwwLTExLjIsMy4yLTE0LDguNGwtMzcuMyw3MC42aDU3LjVjOC43LDAsMTUuOCw3LjEsMTUuOCwxNS44djMxLjYNCgkJCWMwLDguNy03LjEsMTUuOC0xNS44LDE1LjhoLTkwLjlsLTcwLjYsMTMzLjljLTIuNyw1LjItOC4xLDguNC0xNCw4LjRINzYuNEMxMjIuNSw0ODIuNiwxODcuNyw1MTMsMjYwLDUxMw0KCQkJYzEzOS43LDAsMjUzLTExMy4zLDI1My0yNTNjMC0zOS43LTkuMi03Ny4zLTI1LjUtMTEwLjdIMzY0LjR6Ii8+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo=";

export default {
    name: "ReceivePage",

    components: {
        AnimatedTable
    },

    data() {
        return {
            address: null,
            label: '',
            isEditing: false,
            qrCode: null,
            resizeListener: () => this.resizeQrCode(),

            tableFields: [
                {name: AddressBookItemEditableLabel},
                {name: AddressBookItemAddress}
            ]
        };
    },

    computed: {
        ...mapGetters({
            addressBook: 'AddressBook/addressBook',
            receiveAddresses: 'AddressBook/receiveAddresses',
            addresses: 'Transactions/addresses'
        })
    },

    async created() {
        // Make sure everything shows properly on reload.
        while (!window.$daemon) {
            await new Promise(r => setTimeout(r, 10));
        }

        await this.displayAddress();

        window.addEventListener('resize', this.resizeListener);
    },

    destroyed() {
        window.removeEventListener('resize', this.resizeListener);
    },

    // Make sure we always display a fresh address.
    watch: {
        receiveAddresses() {
            if (this.addressBook[this.address]) {
                this.displayAddress();
            }
        },

        addresses() {
            if (this.addresses[this.address]) {
                this.displayAddress();
            }
        }
    },

    methods: {
        navigateToAddressBookItem(item) {
            this.address = item.address;
            this.displayAddress();
        },

        async displayAddress() {
            if (!this.address) {
                this.address = await $daemon.getUnusedAddress();
            }

            if (this.addressBook[this.address] && this.addressBook[this.address].label) {
                this.label = this.addressBook[this.address].label;
            } else {
                this.label = 'Unlabelled';
            }

            if (this.qrCode) {
                this.qrCode.makeCode(this.address)
            } else {
                this.qrCode = new QRCode(this.$refs.qrCode, {
                    text: this.address,
                    height: 2048,
                    width: 2048,
                    colorDark: 'black',
                    colorLight: 'white',
                    logo: FiroSymbol,
                    logoBackgroundColor: 'white',
                    onRenderingEnd: () => this.resizeQrCode()
                });
            }
        },

        resizeQrCode() {
            this.$refs.outerQrCode.classList.remove('shadow');
            this.$refs.qrContainerInner.style.display = 'none';

            const size = `${this.$refs.qrContainer.clientHeight}px`;
            const img = this.$refs.qrCode.querySelector('img');
            img.style.height = size;
            img.style.width = size;
            img.style.display = 'initial';

            this.$refs.qrContainerInner.style.display = 'initial';
            this.$refs.outerQrCode.classList.add('shadow');
        },

        copyAddress() {
            clipboard.writeText(this.address);
        },

        async changeLabel() {
            if (!this.address) return;
            this.isEditing = false;

            let newAddress;
            if (this.addressBook[this.address]) {
                newAddress = await $daemon.updateAddressBookItem(this.addressBook[this.address], this.label);
            } else {
                newAddress = {purpose: 'receive', label: this.label, address: this.address};
                await $daemon.addAddressBookItem(newAddress);
            }
            await this.$store.commit('AddressBook/updateAddress', newAddress);
         }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/inputs";
@import "src/renderer/styles/typography";


$top-height: 40%;

.receive-page {
    height: 100%;
    padding: $size-main-margin;
    box-sizing: border-box;

    .top {
        height: $top-height;
        display: flex;
        flex-direction: column;
        justify-content: end;

        .outer {
            flex-grow: 1;
            padding: $size-tiny-space;

            &.shadow {
                box-shadow: $size-shadow-radius $size-shadow-radius $size-shadow-radius $size-shadow-radius $color-shadow;
            }

            border: {
                width: 0;
                radius: $size-shadow-radius;
            }

            width: fit-content;
            margin: {
                left: auto;
                right: auto;
            }

            .qr-container {
                height: 100%;
            }
        }

        .address {
            flex-grow: 0;

            .label {
                @include label();
                width: fit-content;
                margin: {
                    left: auto;
                    right: auto;
                    top: $size-tiny-space;
                }

                * {
                    display: inline;
                }

                .label-text {
                    margin-bottom: $size-very-tiny-space;
                }

                .label-input {
                    @include wide-rounded-input();
                    margin-bottom: $size-tiny-space;
                }

                input[type="button"] {
                    @include undecorated-button();
                }
            }

            .address {
                width: fit-content;
                margin: {
                    left: auto;
                    right: auto;
                    bottom: $size-tiny-space;
                }
                @include address();
            }
        }
    }

    .bottom {
        height: calc(100% - #{$top-height});
        padding-top: $size-main-margin;

        .animated-table {
            height: 100%;
        }
    }
}
</style>