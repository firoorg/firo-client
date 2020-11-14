<template>
    <div class="receive">
        <div class="top-section">
            <h1>
                Receive Firo
            </h1>
        </div>

        <div ref="qrCode" class="qr-code" />

        <div v-if="address" class="address monospace loaded">
            <a @click.prevent="copyAddress" id="receive-address" href="#" title="Click to copy address">
                {{ address }}
            </a>

            <div class="add-label">
                <label>
                    Add label:
                </label>

                <input type="text" v-model="label" @keydown.enter="addLabel" />
                <input type="button" value="Go!" @click="addLabel" />
            </div>
        </div>
        <div v-else class="address loading">
            Loading...
        </div>
    </div>
</template>

<script>
import {clipboard} from "electron";
import QRCode from "easyqrcodejs";
import {mapGetters} from "vuex";

export default {
    name: "Receive",

    data: () => ({
        address: null,
        label: '',
        isAdding: false,
        qrCode: null
    }),

    async created() {
        // Make sure everything shows properly on reload.
        while (!window.$daemon) {
            await new Promise(r => setTimeout(r, 10));
        }

        await this.displayAddress();
    },

    computed: mapGetters({
        paymentRequests: 'PaymentRequest/paymentRequests',
        addresses: 'Transactions/addresses'
    }),

    watch: {
        paymentRequests() {
            if (this.paymentRequests[this.address]) {
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
        async displayAddress() {
            this.address = await $daemon.getUnusedAddress();

            if (this.paymentRequests[this.address]) {
                this.label = this.paymentRequests[this.address].label;
            }

            if (!this.qrcode) {
                this.qrcode = new QRCode(this.$refs.qrCode, {
                    text: this.address,
                    width: 256,
                    height: 256,
                    // $firo-creole
                    colorDark: '#110202',
                    // $firo-mine-shaft
                    colorLight: '#cfcccc',
                    logo: '/assets/FiroSymbolDark.svg',
                    // $firo-silver
                    logoBackgroundColor: '#cfcccc',
                    logoWidth: 60,
                    logoHeight: 60
                });
            } else {
                // Update the address in the QR code.
                this.qrcode.makeCode(this.address);
            }
        },

        copyAddress() {
            clipboard.writeText(this.address);
        },

        async addLabel() {
            if (!this.address) return;
            if (this.isAdding) return;
            this.isAdding = true;

            const pr = await $daemon.createPaymentRequest(undefined, this.label, '', this.address);
            await this.$store.dispatch('PaymentRequest/addOrUpdatePaymentRequestFromResponse', pr);

            while (true) {
                await new Promise(resolve => setTimeout(resolve, 10));

                if (this.paymentRequests[pr.address]) {
                    this.$router.push('/payment-request/' + pr.address);
                    break;
                }
            }

            await this.displayAddress();
            this.isAdding = false;
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/inputs";


.receive {
    height: 100%;

    padding: {
        left: 2em;
        right: 2em;
    }

    .top-section {
        @include top-section();

        h1 {
            text-align: center;
        }
    }

    .qr-code {
        width: fit-content;
        margin: {
            top: $size-medium-space;
            bottom: $size-medium-space;
            left: auto;
            right: auto;
        }
    }

    .address {
        width: fit-content;
        margin: {
            left: auto;
            right: auto;
        }

        &.loading {
            font-style: italic;
        }

        &.loaded {
            a {
                text-decoration: none;
                color: inherit;
            }
        }

        .add-label {
            margin-top: $size-medium-space;

            label {
                display: block;
                margin-bottom: $size-tiny-space;
            }

            input[type="text"] {
                @include input-field();
            }

            input[type="button"] {
                @include undecorated-button();
            }
        }
    }
}
</style>
