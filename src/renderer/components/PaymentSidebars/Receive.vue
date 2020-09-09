<template>
    <div class="receive">
        <div class="inner">
            <div class="title">
                Receive Zcoin
            </div>

            <div ref="qrCode" class="qr-code" />

            <div v-if="address" class="address loaded">
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
                    // $color--comet-dark
                    colorDark: '#52527A',
                    // $color--comet-light
                    colorLight: '#E2E2E9',
                    // This is an encoded version of https://zcoin.io/storage/2017/12/ci_icon_circle_green.png.zip
                    logo: "data:image/png;base64, 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",
                    // $color--comet-dark
                    logoBackgroundColor: '#52527A',
                    logoWidth: 45,
                    logoHeight: 45
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
.receive {
    height: 100%;
    background: $color--comet-light;
    color: $color--comet-dark;

    padding: {
        top: 2em;
        left: 2em;
        right: 2em;
    }

    .inner {
        height: fit-content;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        .title {
            text-align: center;
            font: {
                size: 3em;
            }
        }

        .qr-code {
            width: fit-content;
            margin: {
                top: 5em;
                bottom: 5em;
                left: auto;
                right: auto;
            }
        }

        .address {
            width: fit-content;
            margin: auto;

            font: {
                family: monospace;
                weight: bold;
                size: 1.3em;
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
                margin-top: 1.5em;

                label {
                    display: block;
                }

                input[type="text"] {
                    border: none;
                    border-radius: 25px;
                    outline: none;
                }

                input[type="button"] {
                    cursor: pointer;
                    background-color: inherit;
                    border-radius: 25px;
                    border-width: 0;

                    &:focus {
                        outline: none;
                    }

                    font-weight: bold;
                }
            }
        }
    }
}
</style>
