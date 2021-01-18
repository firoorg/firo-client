<template>
    <div>
        <div class="buttons">
            <button :disabled="disabled" @click="show = 'info'">
                Exchange
            </button>
        </div>

        <Popup v-if="show !== 'button'" :margin="show !== 'wait'">
            <CoinSwapInfo
                v-if="show === 'info' && coinSwapRecord"
                :coin-swap-data="coinSwapRecord"
                :show-cancel="true"
                @cancel="cancel()"
                @confirm="goToPassphraseStep()"
            />
            <PassphraseStep v-if="show === 'passphrase'" :error="error" v-model="passphrase" @cancel="cancel()" @confirm="attemptSend" />
            <WaitOverlay v-if="show === 'wait' || show === 'info' && !coinSwapRecord" />
            <ErrorStep v-if="show === 'error'" :error="error" @ok="cancel()" />
        </Popup>
    </div>
</template>

<script>
// $emits: success

import {FirodErrorResponse, IncorrectPassphrase} from 'daemon/firod';
import Popup from 'renderer/components/shared/Popup';
import CoinSwapInfo from 'renderer/components/CoinSwapPage/CoinSwapInfo';
import PassphraseStep from './PassphraseStep';
import ErrorStep from './ErrorStep';
import WaitOverlay from 'renderer/components/shared/WaitOverlay';
import APIWorker from 'lib/switchain-api';
import {convertToCoin} from "lib/convert";
import {isValidAddress} from "lib/isValidAddress";
import {mapActions, mapGetters} from "vuex";

export default {
    name: 'CoinSwapFlowFromFiro',

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
            orderID: '',
            exchangeAddress: '',
            error: null,
            show: 'button',
            passphrase: ''
        };
    },

    props: {
        disabled: {
            required: true,
            type: Boolean
        },

        isPrivate: {
            type: Boolean
        },

        txFeePerKb: {
            type: Number
        },

        // e.g. "USDT"
        remoteCurrency: {
            type: String,
        },

        // This is a normal satoshi amount of FIRO.
        firoAmount: {
            type: Number,
        },

        // This is a decimal STRING representing a whole coin amount (NOT satoshi) AFTER all fees are calculated.
        remoteAmount: {
            type: String,
        },

        // This is a normal satoshi amount of FIRO.
        firoTransactionFee: {
            type: Number,
        },

        // This is a decimal STRING representing a whole coin amount, NOT satoshi
        remoteTransactionFee: {
            type: String,
        },

        // The address that funds will be received at.
        receiveAddress: {
            type: String,
        },

        expectedRate: {
            type: String,
        },

        // an identifier for a specific offer in order to lock-in rates
        signature: {
            type: String
        }
    },

    created() {
        this.api = new APIWorker();
    },

    asyncComputed: {
        async coinSwapRecord() {
            const isPrivate = this.isPrivate;
            const txFeePerKb = this.txFeePerKb;
            const remoteCurrency = this.remoteCurrency;
            const firoAmount = this.firoAmount;
            const remoteAmount = this.remoteAmount;
            const firoTransactionFee = this.firoTransactionFee;
            const remoteTransactionFee = this.remoteTransactionFee;
            const receiveAddress = this.receiveAddress;
            const expectedRate = this.expectedRate;
            const show = this.show;
            const signature = this.signature;

            const walletAddress = await $daemon.getUnusedAddress();

            if (!(
                isPrivate !== undefined && txFeePerKb && remoteCurrency && firoAmount && remoteAmount &&
                firoTransactionFee && remoteTransactionFee && receiveAddress && expectedRate &&
                // We don't want to fetch records too eagerly, so we check that we're not in the button state before
                // fetching.
                show !== 'button'
            )) return;

            let response;
            try {
                const order = {
                    pair: `XZC-${remoteCurrency}`,
                    toAddress: receiveAddress,
                    refundAddress: walletAddress,
                    fromAmount: convertToCoin(firoAmount),
                    signature
                };

                this.$log.info("Posting order: %O", order);

                // The API accepts a signature to commit to a specific offer, but it's only valid for 60s and is
                // therefore unusable practically.
                const r = await this.api.postOrder(order);
                if (r.error || !r.response) throw r.error;
                response = r.response;

                // Sanity check response
                if (
                    response.fromAmount !== convertToCoin(firoAmount) ||
                    response.refundAddress !== walletAddress ||
                    response.toAddress !== receiveAddress ||
                    !isValidAddress(response.exchangeAddress, 'main')
                ) {
                    this.$log.error("Invalid Response: %O", response);
                    throw 'invalid response from SwitchChain';
                }

                // We do this here instead of attemptSend so that the user won't receive to this address again, even if
                // they don't swap.
                const refundAddressBookData = {
                    address: walletAddress,
                    label: `FIRO-${remoteCurrency} Swap Refund (Order ${response.orderId})`,
                    purpose: 'coinswapRefund'
                };

                const sendAddressBookData = {
                    address: response.exchangeAddress,
                    label: `FIRO-${remoteCurrency} Swap (Order ${response.orderId})`,
                    purpose: 'coinswapSend'
                };

                for (const data of [refundAddressBookData, sendAddressBookData]) {
                    $store.commit('AddressBook/updateAddress', data);
                    await $daemon.addAddressBookItem(data);
                }
            } catch(e) {
                this.error = `${e}`;
                this.show = 'error';
                return
            }

            return {
                orderId: response.orderId,
                fromCoin: 'FIRO',
                toCoin: remoteCurrency,
                sendAmount: response.fromAmount,
                expectedAmountToReceive: remoteAmount,
                expectedRate: expectedRate,
                fromFee: convertToCoin(firoTransactionFee),
                expectedToFee: remoteTransactionFee,
                status: 'waiting',
                date: Date.now(),
                exchangeAddress: response.exchangeAddress,
                refundAddress: response.refundAddress,
                receiveAddress: response.toAddress,
                _response: response
            };
        }
    },

    computed: mapGetters({
        isLelantusAllowed: 'ApiStatus/isLelantusAllowed'
    }),

    methods: {
        ...mapActions({
            addCoinSwapRecords: 'CoinSwap/addOrUpdateRecords'
        }),

        convertToCoin,

        goToPassphraseStep() {
            this.show = 'passphrase';
        },

        cancel(cleanUpForm = false) {
            this.error = null;
            this.show = 'button';

            if (cleanUpForm) {
                this.$emit('success');
            }
        },

        async attemptSend() {
            this.show = 'wait';
            const passphrase = this.passphrase;
            this.passphrase = '';

            try {
                if (!this.isPrivate) {
                    await $daemon.publicSend(passphrase, `Coin Swap FIRO-${this.remoteCurrency}`,
                        this.coinSwapRecord.exchangeAddress, this.firoAmount, this.txFeePerKb,false);
                } else if (this.isLelantusAllowed) {
                    const r = await $daemon.sendLelantus(passphrase, this.coinSwapRecord.exchangeAddress, this.firoAmount,
                        this.txFeePerKb,false);

                    $store.commit('Transactions/markSpentTransaction', r.inputs);
                } else {
                    await $daemon.sendSigma(passphrase, `Coin Swap FIRO-${this.remoteCurrency}`,
                        this.coinSwapRecord.exchangeAddress, this.firoAmount, false);
                }

                await this.addCoinSwapRecords([this.coinSwapRecord]);
            } catch (e) {
                if (e instanceof IncorrectPassphrase) {
                    this.error = 'Incorrect Passphrase';
                    this.show = 'passphrase';
                } else if (e instanceof FirodErrorResponse) {
                    this.error = e.errorMessage;
                    this.show = 'error';
                } else {
                    this.error = `${e}`;
                    this.show = 'error';
                }

                return;
            }

            this.show = 'button';
            this.error = null;
            this.$emit('success');
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
