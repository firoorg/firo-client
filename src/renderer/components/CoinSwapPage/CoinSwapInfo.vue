<template>
    <div class="info-popup">
        <div class="title">Coin Swap Information</div>

        <div class="content">
            <div v-if="showQrCode" ref="qrCode" class="qr-code" />
            <div v-if="showQrCode" class="exchange-address">
                {{ coinSwapData.exchangeAddress }}
            </div>

            <table>
                <tr>
                    <td>Status</td>
                    <td>{{ coinSwapData.status }}</td>
                </tr>

                <tr>
                    <td>Chain</td>
                    <td>{{ coinSwapData.chainName }}</td>
                </tr>

                <tr>
                    <td>Swap ID</td>
                    <td>{{ coinSwapData.orderId }}</td>
                </tr>

                <tr>
                    <td>{{ coinSwapData.fromCoin }} Address</td>
                    <td>{{ coinSwapData.exchangeAddress }}</td>
                </tr>

                <tr>
                    <td>{{ coinSwapData.toCoin }} Address</td>
                    <td>{{ coinSwapData.receiveAddress }}</td>
                </tr>

                <tr>
                    <td>{{ coinSwapData.fromCoin }} Refund Address</td>
                    <td>{{ coinSwapData.refundAddress }}</td>
                </tr>

                <tr>
                    <td>Expected Rate</td>
                    <td class="value">
                        <Amount amount="1" :ticker="coinSwapData.fromCoin" />
                        =
                        <Amount :amount="String(coinSwapData.expectedRate)" :ticker="coinSwapData.toCoin" />
                    </td>
                </tr>

                <tr>
                    <td>Amount to Send</td>
                    <td><Amount :amount="coinSwapData.sendAmount" :ticker="coinSwapData.fromCoin" /></td>
                </tr>

                <tr v-if="coinSwapData.fromFee">
                    <td>{{ coinSwapData.fromCoin }} Fee</td>
                    <td><Amount :amount="coinSwapData.fromFee" :ticker="coinSwapData.fromCoin" /></td>
                </tr>

                <tr>
                    <td>Expected {{ coinSwapData.toCoin }} Fee</td>
                    <td><Amount :amount="String(coinSwapData.expectedToFee)" :ticker="coinSwapData.toCoin" /></td>
                </tr>

                <tr>
                    <td>Estimated Total to Receive</td>
                    <td><Amount :amount="String(coinSwapData.expectedAmountToReceive)" :ticker="coinSwapData.toCoin" /></td>
                </tr>

                <tr v-if="coinSwapData.actualAmountToReceive">
                    <td>Actual Amount To Receive</td>
                    <td><Amount :amount="coinSwapData.actualAmountToReceive" :ticker="coinSwapData.toCoin" /></td>
                </tr>

                <tr v-if="coinSwapData.depositTxId">
                    <td>{{ coinSwapData.fromCoin }} Transaction</td>

                    <td v-if="coinSwapData.fromCoin === 'FIRO'" class="value">
                        <TransactionId :txid="coinSwapData.depositTxId" />
                    </td>
                    <td v-else>
                        {{ coinSwapData.depositTxId }}
                    </td>
                </tr>

                <tr v-if="coinSwapData.outputTxId" class="field">
                    <td>
                        {{ coinSwapData.toCoin }} Transaction
                    </td>

                    <td v-if="coinSwapData.toCoin === 'FIRO'">
                        <TransactionId :txid="coinSwapData.outputTxId" />
                    </td>
                    <td v-else>
                        {{ coinSwapData.outputTxId }}
                    </td>
                </tr>

                <tr v-if="coinSwapData.refundTx" class="field">
                    <td>
                        {{ coinSwapData.fromCoin }} Refund Transaction
                    </td>

                    <td v-if="coinSwapData.fromCoin === 'FIRO'">
                        <TransactionId :txid="coinSwapData.refundTx" />
                    </td>
                    <td v-else>
                        {{ coinSwapData.refundTx }}
                    </td>
                </tr>
            </table>

            <div v-if="showQrCode" class="footer guidance">
                Please send the exact amount shown. If you send a different amount, you will need to contact ChangeNow
                support at <a href="mailto:support@changenow.io">support.changenow.io</a> to recover your funds.
            </div>

            <div v-else class="footer guidance">
                If you need assistance or funds fail to arrive in a timely fashion, you can contact ChangeNow at
                <a href="mailto:support@changenow.io">support.changenow.io</a>.
            </div>
        </div>

        <div class="buttons">
            <button v-if="showCancel" class="solid-button unrecommended" @click="$emit('cancel')">
                Cancel
            </button>

            <button class="solid-button recommended" @click="$emit('confirm')">
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

    margin: {
        top: var(--padding-base);
        bottom: var(--padding-base);
    }
}

.footer {
    max-width: 500px;
    margin: {
        top: var(--padding-base);
        left: auto;
        right: auto;
    }
}
</style>
