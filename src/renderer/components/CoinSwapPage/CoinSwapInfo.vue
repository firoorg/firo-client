<template>
    <div>
        <div class="title">
            Coin Swap Information
        </div>

        <div class="content">
            <div v-if="showQrCode" ref="qrCode" class="qr-code" />
            <div v-if="showQrCode" class="exchange-address">
                {{ coinSwapData.exchangeAddress }}
            </div>

            <div class="fields">
                <div class="field">
                    <label>
                        Status
                    </label>

                    <div :class="`value status status-${coinSwapData.status}`">
                        {{ coinSwapData.status.toUpperCase() }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Switchain Swap ID
                    </label>

                    <div class="value">
                        {{ coinSwapData.orderId }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        {{ coinSwapData.fromCoin }} Address
                    </label>

                    <div class="value address">
                        {{ coinSwapData.exchangeAddress }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        {{ coinSwapData.toCoin }} Address
                    </label>

                    <div class="value address">
                        {{ coinSwapData.receiveAddress }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        {{ coinSwapData.fromCoin }} Refund Address
                    </label>

                    <div class="value address">
                        {{ coinSwapData.refundAddress }}
                    </div>
                </div>

                <div class="field">
                    <label>Expected Rate</label>

                    <div class="value">
                        <Amount amount="1" :ticker="coinSwapData.fromCoin" />
                        =
                        <Amount :amount="coinSwapData.expectedRate" :ticker="coinSwapData.toCoin" />
                    </div>
                </div>

                <div class="field">
                    <label>
                        Amount to Send
                    </label>

                    <div class="value">
                        <Amount :amount="coinSwapData.sendAmount" :ticker="coinSwapData.fromCoin" />
                    </div>
                </div>

                <div v-if="coinSwapData.fromFee" class="field">
                    <label>
                        {{ coinSwapData.fromCoin }} Fee
                    </label>

                    <div class="value">
                        <Amount :amount="coinSwapData.fromFee" :ticker="coinSwapData.fromCoin" />
                    </div>
                </div>

                <div class="field">
                    <label>
                        Expected {{ coinSwapData.toCoin }} Fee
                    </label>

                    <div class="value">
                        <Amount :amount="coinSwapData.expectedToFee" :ticker="coinSwapData.toCoin" />
                    </div>
                </div>

                <div class="field">
                    <label>
                        Estimated Total to Receive
                    </label>

                    <div class="value">
                        <Amount :amount="coinSwapData.expectedAmountToReceive" :ticker="coinSwapData.toCoin" />
                    </div>
                </div>

                <div v-if="coinSwapData.actualAmountToReceive" class="field">
                    <label>Actual Amount To Receive</label>

                    <div class="value">
                        <Amount :amount="coinSwapData.actualAmountToReceive" :ticker="coinSwapData.toCoin" />
                    </div>
                </div>

                <div v-if="coinSwapData.depositTxId" class="field">
                    <label>
                        {{ coinSwapData.fromCoin }} Transaction
                    </label>

                    <div v-if="coinSwapData.fromCoin === 'FIRO'" class="value">
                        <TransactionId :txid="coinSwapData.depositTxId" />
                    </div>
                    <div v-else>
                        {{ coinSwapData.depositTxId }}
                    </div>
                </div>

                <div v-if="coinSwapData.outputTxId" class="field">
                    <label>
                        {{ coinSwapData.toCoin }} Transaction
                    </label>

                    <div v-if="coinSwapData.toCoin === 'FIRO'" class="value">
                        <TransactionId :txid="coinSwapData.outputTxId" />
                    </div>
                    <div v-else>
                        {{ coinSwapData.outputTxId }}
                    </div>
                </div>

                <div v-if="coinSwapData.refundTx" class="field">
                    <label>
                        {{ coinSwapData.fromCoin }} Refund Transaction
                    </label>

                    <div v-if="coinSwapData.fromCoin === 'FIRO'" class="value">
                        <TransactionId :txid="coinSwapData.refundTx" />
                    </div>
                    <div v-else>
                        {{ coinSwapData.refundTx }}
                    </div>
                </div>
            </div>

            <div v-if="showQrCode" class="footer guidance">
                Please send the exact amount shown. If you send a different amount, you will need to contact Switchain
                support at <a href="mailto:help@switchain.com">help@switchain.com</a> to recover your funds.
            </div>

            <div v-else class="footer guidance">
                If you need assistance or funds fail to arrive in a timely fashion, you can contact Switchain at
                <a href="mailto:help@switchain.com">help@switchain.com</a>.
            </div>
        </div>

        <div class="buttons">
            <button v-if="showCancel" class="disrecommended" @click="$emit('cancel')">
                Cancel
            </button>

            <button @click="$emit('confirm')">
                OK
            </button>
        </div>
    </div>
</template>

<script>
// $emits: cancel, confirm
import { convertToCoin } from 'lib/convert'
import Amount from "renderer/components/shared/Amount";
import QRCode from "easyqrcodejs";
import TransactionId from "renderer/components/shared/TransactionId";

export default {
    name: 'CoinSwapInfo',

    components: {
        TransactionId,
        Amount
    },

    props: {
        // This must be a src/store/modules/CoinSwap.ts:CoinSwapRecord
        coinSwapData: {
            type: Object,
            required: true
        },

        // Should we show the cancel button?
        showCancel: {
            type: Boolean,
            required: true
        }
    },

    data() {
        return {
            qrCode: null
        };
    },

    mounted() {
        this.displayQrCode();
    },

    computed: {
        showQrCode() {
            return this.coinSwapData.toCoin === 'FIRO' && this.coinSwapData.status === 'waiting';
        }
    },

    methods: {
        convertToCoin,

        displayQrCode() {
            if (!this.showQrCode) return;

            // We will only be shown if toCoin is FIRO.
            if (!this.qrCode) {
                this.qrCode = new QRCode(this.$refs.qrCode, {
                    text: this.coinSwapData.exchangeAddress,
                    width: 200,
                    height: 200,
                    colorDark: 'black',
                    colorLight: 'white',
                    logoBackgroundColor: '#52527A'
                });
            } else {
                this.qrCode.makeCode(this.coinSwapData.exchangeAddress);
            }
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/typography";

@include info-popup();

.qr-code {
    display: block;
    width: fit-content;
    margin: {
        left: auto;
        right: auto;
    }
}

.exchange-address {
    text-align: center;
    @include address();

    margin: {
        top: $size-small-space;
        bottom: $size-popup-margin;
    }
}

.footer {
    margin: {
        top: $size-popup-margin;
        left: auto;
        right: auto;
    }
}

.status-expired, .status-failed {
    @include error();
}
</style>
