<template>
    <div>
        <div class="title">
            Please send {{ amount }} ETH to this address to complete {{ selectedCoin }} -> FIRO swap
        </div>

        <div class="content">
            <div class="align-center">
                <label>Order ID: {{ orderID }}</label>
            </div>

            <div ref="qrCode" class="qr-code" />

            <div class="copy-wrapper">
                <input
                    id="label"
                    ref="label"
                    type="text"
                    name="label"
                    tabindex="1"
                    placeholder="Amount"
                    :value="address"
                    @click.prevent="Utils.copyToClipboard(address)"
                />
                <div class="buttons">
                    <button class="copy-btn">Copy</button>
                </div>
            </div>
        </div>

        <div class="buttons">
            <button @click="$emit('cancel')">
                Cancel
            </button>
        </div>
    </div>
</template>

<script>
import QRCode from 'easyqrcodejs';
import Utils from 'renderer/utils';

export default {
    name: 'QRCodeStep',

    props: {
        orderID: {
            required: true,
            type: String
        },

        address: {
            required: true,
            type: String
        },

        amount: {
            required: true,
            type: Number
        },
        
        selectedCoin: {
            required: true,
            type: String
        }
    },

    data() {
        return {
            qrCode: null,
        };
    },

    methods: {
        displayQRCode() {
            if (!this.qrCode) {
                this.qrCode = new QRCode(this.$refs.qrCode, {
                    text: this.address,
                    width: 256,
                    height: 256,
                    colorDark: '#52527A',
                    colorLight: '#E2E2E9',
                    logoBackgroundColor: '#52527A',
                    logoWidth: 45,
                    logoHeight: 45
                });
            } else {
                this.qrCode.makeCode(this.address);
            }
        },
    },

    mounted() {
        this.displayQRCode();
    }
};
</script>

<style scoped lang="scss">
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/popup";
@import "src/renderer/styles/inputs";

@include popup();

input {
    @include wide-input-field();
}

.error {
    margin-top: $size-between-field-space-big;
    @include error();
}

.qr-code {
    width: 260px;
    margin: 25px auto;
}

.copy-wrapper {
    display: flex;
}

.align-center {
    text-align: center;
}

.buttons .copy-btn {
    @include undecorated-button();
}
</style>
