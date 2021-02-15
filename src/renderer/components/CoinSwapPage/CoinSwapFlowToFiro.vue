<template>
    <div>
        <div class="buttons">
            <button :disabled="disabled" @click="displayInfo">
                Exchange
            </button>
        </div>

        <Popup v-if="show !== 'button'" :margin="show !== 'wait'">
            <ErrorStep v-if="show === 'error'" :error="error" @ok="cleanup(false)" />
            <WaitOverlay v-else-if="show === 'wait'" />
            <CoinSwapInfo
                v-if="show === 'info'"
                :coin-swap-data="coinSwapRecord"
                :show-cancel="false"
                @confirm="cleanup(true)"
            />
        </Popup>
    </div>
</template>

<script>
// $emits: success

import Popup from 'renderer/components/shared/Popup';
import CoinSwapInfo from 'renderer/components/CoinSwapPage/CoinSwapInfo';
import PassphraseStep from './PassphraseStep';
import ErrorStep from './ErrorStep';
import WaitOverlay from 'renderer/components/shared/WaitOverlay';
import APIWorker from 'lib/switchain-api';
import {convertToCoin} from "lib/convert";
import {mapActions} from "vuex";
import Big from "big.js";

export default {
    name: 'CoinSwapFlowToFiro',

    components: {
        Popup,
        CoinSwapInfo,
        PassphraseStep,
        ErrorStep,
        WaitOverlay
    },

    data() {
        return {
            api: null,
            orderId: '',
            exchangeAddress: '',
            error: null,
            show: 'button',
            passphrase: '',
            conversionRate: '',
            coinSwapRecord: null
        };
    },

    props: {
        disabled: {
            required: true,
            type: Boolean
        },

        // e.g. "USDT"
        remoteCurrency: {
            type: String,
        },

        // This is a decimal STRING representing a whole coin amount of FIRO that you are expected to receive.
        firoAmount: {
            type: String,
        },

        // This is a decimal STRING representing a whole coin amount (NOT satoshi) AFTER all fees are calculated.
        remoteAmount: {
            type: String,
        },

        // This is a decimal STRING representing a whole coin amount of FIRO that will be charged as a fee.
        firoTransactionFee: {
            type: String,
        },

        // The address that funds will be refunded at if the trade fails for some reason.
        refundAddress: {
            type: String
        },

        // The expected amount of FIRO we will receive for each remoteCurrency, as a string whole-coin amount.
        expectedRate: {
            type: String
        },

        // an identifier for a specific offer in order to lock-in rates
        signature: {
            type: String
        }
    },

    created() {
        this.api = new APIWorker();
    },

    methods: {
        ...mapActions({
            addCoinSwapRecords: 'CoinSwap/addOrUpdateRecords'
        }),

        convertToCoin,

        cleanup(emitSuccess=true) {
            this.orderId = '';
            this.exchangeAddress = '';
            this.error = null;
            this.show = 'button';

            if (emitSuccess) this.$emit('success');
        },

        async displayInfo() {
            this.show = 'wait';

            while (!window.$daemon) {
                await new Promise(r => setTimeout(r, 10));
            }
            const walletAddress = await $daemon.getUnusedAddress();

            try {
                const { error, response } = await this.api.postOrder({
                    pair: `${this.remoteCurrency}-FIRO`,
                    fromAmount: this.remoteAmount,
                    toAddress: walletAddress,
                    toAmount: this.firoAmount,
                    refundAddress: this.refundAddress,
                    signature: this.signature
                });
                if (error || !response) throw error;

                // Sanity check response
                if (
                    !(new Big(response.fromAmount)).eq(this.remoteAmount) ||
                    response.refundAddress !== this.refundAddress ||
                    response.toAddress !== walletAddress
                ) {
                    this.$log.error("Invalid Response: %O", response);
                    throw 'invalid response from SwitchChain';
                }

                this.coinSwapRecord = {
                    orderId: response.orderId,
                    fromCoin: this.remoteCurrency,
                    toCoin: 'FIRO',
                    sendAmount: this.remoteAmount,
                    expectedAmountToReceive: this.firoAmount,
                    fromFee: null,
                    expectedToFee: this.firoTransactionFee,
                    status: 'waiting',
                    date: Date.now(),
                    exchangeAddress: response.exchangeAddress,
                    refundAddress: this.refundAddress,
                    receiveAddress: walletAddress,
                    expectedRate: this.expectedRate,
                    _response: response
                };

                await this.addCoinSwapRecords([this.coinSwapRecord]);

                const refundAddressBookData = {
                    address: walletAddress,
                    label: `${this.remoteCurrency}-FIRO Swap (Order ${response.orderId})`,
                    purpose: 'coinswapReceive'
                };
                $store.commit('AddressBook/updateAddress', refundAddressBookData);
                await $daemon.addAddressBookItem(refundAddressBookData);
            } catch (e) {
                this.coinSwapRecord = null;
                this.error = `${e}`;
                this.show = 'error';

                return;
            }

            this.show = 'info';
            this.error = null;
        }
    }
};
</script>

<style scoped lang="scss">
@import 'src/renderer/styles/inputs';

.buttons {
    @include buttons-container();
}
</style>
