<template>
    <div>
        <div class="buttons">
            <button class="solid-button unrecommended" @click="$emit('reset')">
                Reset
            </button>

            <button :disabled="disabled" class="solid-button recommended" @click="showInfo">
                Exchange
            </button>
        </div>

        <Popup v-if="show !== 'button'" :margin="show !== 'wait'">
            <CoinSwapInfo
                v-if="show === 'info'"
                :coin-swap-data="coinSwapRecord"
                :show-cancel="true"
                @cancel="cancel()"
                @confirm="goToPassphraseStep()"
            />
            <PassphraseInput v-if="show === 'passphrase'" :error="error" v-model="passphrase" @cancel="cancel()" @confirm="attemptSend" />
            <WaitOverlay v-if="show === 'wait'" />
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
import PassphraseInput from "renderer/components/shared/PassphraseInput";

export default {
    name: 'CoinSwapFlowFromFiro',

    components: {
        PassphraseInput,
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
            passphrase: '',
            coinSwapRecord: null
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

        isBigWallet: {
            type: Boolean
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

        async showInfo() {
            if (this.show !== 'button') return;
            this.show = 'wait';

            const pair = `FIRO-${this.remoteCurrency}`;
            while (!window.$daemon) {
                await new Promise(r => setTimeout(r, 10));
            }
            const walletAddress = await $daemon.getUnusedAddress();

            let latestError = null;
            for (let i = 0; i < 10; i++) {
                const marketInfo = await this.api.getMarketInfo();
                if (marketInfo.error) {
                    latestError = `Error fetching market info: ${marketInfo.error}`;
                    this.$log.error(latestError);
                    await new Promise(r => setTimeout(r, 1e3));
                    continue;
                }

                const pairInfo = marketInfo.response.find(mi => mi.pair === pair);
                if (!pairInfo) {
                    this.show = 'error';
                    this.error = `Pair ${pair} not found in Switchain markets`;
                    return;
                }

                const order = {
                    pair,
                    toAddress: this.receiveAddress,
                    refundAddress: walletAddress,
                    fromAmount: convertToCoin(this.firoAmount),
                    signature: pairInfo.signature
                };

                this.$log.info("Posting order: %O", order);

                let r;
                try {
                    r = await this.api.postOrder(order);
                } catch (e) {
                    latestError = `Error posting order: ${e}`;
                    this.$log.error(latestError);
                    continue;
                }

                if (r.error || !r.response) {
                    latestError = `Got error posting order: ${r.error}`;
                    this.$log.error(latestError);
                    continue;
                }

                const response = r.response;

                // Sanity check response
                if (
                    response.fromAmount !== convertToCoin(this.firoAmount) ||
                    response.refundAddress !== walletAddress ||
                    response.toAddress !== this.receiveAddress ||
                    !isValidAddress(response.exchangeAddress, 'main')
                ) {
                    latestError = `Invalid Response from Switchain: ${JSON.stringify(response)}`;
                    this.$log.error(latestError);
                    continue;
                }

                // We do this here instead of attemptSend so that the user won't receive to this address again, even if
                // they don't swap.
                const refundAddressBookData = {
                    address: walletAddress,
                    label: `${pair} Swap Refund (Order ${response.orderId})`,
                    purpose: 'coinswapRefund'
                };

                const sendAddressBookData = {
                    address: response.exchangeAddress,
                    label: `${pair} Swap (Order ${response.orderId})`,
                    purpose: 'coinswapSend'
                };

                for (const data of [refundAddressBookData, sendAddressBookData]) {
                    $store.commit('AddressBook/updateAddress', data);
                    try {
                        await $daemon.addAddressBookItem(data);
                    } catch (e) {
                        this.$log.error(`Failed to add address book item: ${e}`);
                        this.error = `Failed to add address book item: ${e && e.message ? e.message : e}`;
                        this.show = 'error';
                        return;
                    }
                }

                this.coinSwapRecord = {
                    orderId: response.orderId,
                    fromCoin: 'FIRO',
                    toCoin: this.remoteCurrency,
                    sendAmount: response.fromAmount,
                    expectedAmountToReceive: this.remoteAmount,
                    expectedRate: this.expectedRate,
                    fromFee: convertToCoin(this.firoTransactionFee),
                    expectedToFee: this.remoteTransactionFee,
                    status: 'waiting',
                    date: Date.now(),
                    exchangeAddress: response.exchangeAddress,
                    refundAddress: response.refundAddress,
                    receiveAddress: response.toAddress,
                    _response: response
                };

                this.show = 'info';
                return;
            }

            this.show = 'error';
            this.error = latestError || 'Uh oh, something went wrong :(';
            this.$log.error(`Gave up sending to Switchain after 10 errors.`);
        },

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
                if (this.isPrivate) {
                    const r = await $daemon.sendLelantus(passphrase, this.coinSwapRecord.exchangeAddress,
                        this.firoAmount, this.txFeePerKb, false);

                    $store.commit('Transactions/markSpentTransaction', r.inputs);
                } else {
                    const r = await $daemon.publicSend(passphrase, `Coin Swap FIRO-${this.remoteCurrency}`,
                        this.coinSwapRecord.exchangeAddress, this.firoAmount, this.txFeePerKb, false);

                    $store.commit('Transactions/markSpentTransaction', r.inputs);
                }

                try {
                    await this.addCoinSwapRecords([this.coinSwapRecord]);
                } catch(e) {
                    this.$log.error(`Failed to add CoinSwap record: ${e}`);
                    this.show = 'error';
                    this.error = e;
                    return;
                }
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
.buttons {
    display: flex;
    justify-content: space-evenly;
}
</style>
