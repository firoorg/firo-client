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
import ErrorStep from './ErrorStep';
import WaitOverlay from 'renderer/components/shared/WaitOverlay';
import ChangeAPIWorker from 'lib/changenow-api';
import StealthAPIWorker from 'lib/stealth-api';
import SwapzoneAPIWorker from 'lib/swapzone-api';
import ExolixAPIWorker from 'lib/exolix-api';
import {bigintToString} from "lib/convert";
import {mapActions, mapGetters} from "vuex";
import PassphraseInput from "renderer/components/shared/PassphraseInput";

export default {
    name: 'CoinSwapFlowFromFiro',

    components: {
        PassphraseInput,
        Popup,
        CoinSwapInfo,
        ErrorStep,
        WaitOverlay
    },

    data() {
        return {
            change: null,
            stealth: null, 
            swapzone: null,
            exolix:null,
            orderID: '',
            exchangeAddress: '',
            error: null,
            show: 'button',
            passphrase: '',
            coinSwapRecord: null
        };
    },

    props: {
        disabled: Boolean,
        isPrivate: Boolean,
        chainName: String,
        txFeePerKb: BigInt,
        // e.g. "USDT"
        remoteCurrency: String,
        firoAmount: BigInt,
        remoteAmount: BigInt,
        firoTransactionFee: BigInt,
        remoteTransactionFee: BigInt,
        receiveAddress: String,
        expectedRate: BigInt,
        quotaId: String
    },

    created() {
        this.change = new ChangeAPIWorker();
        this.stealth = new StealthAPIWorker();
        this.swapzone = new SwapzoneAPIWorker();
        this.exolix = new ExolixAPIWorker();
    },

    methods: {
        ...mapActions({
            addCoinSwapRecords: 'CoinSwap/addOrUpdateRecords'
        }),

        bigintToString,

        async showInfo() {
            if (this.show !== 'button') return;
            this.show = 'wait';

            const pair = `FIRO-${this.remoteCurrency}`;
            while (!window.$daemon) {
                await new Promise(r => setTimeout(r, 10));
            }
            const walletAddress = await $daemon.getUnusedAddress();

            let latestError = null;
            for (let i = 0; i < 1; i++) {
                if (this.chainName === "ChangeNow"){
                    const order = {
                        from:"firo",
                        to:this.remoteCurrency.toLowerCase(),
                        address: this.receiveAddress,
                        refundAddress: walletAddress,
                        amount: bigintToString(this.firoAmount)
                    };

                    this.$log.info("Posting order: %O", order);

                    let r;
                    try {
                        r = await this.change.postOrder(order);
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
                        response.refundAddress !== walletAddress ||
                        response.payoutAddress !== this.receiveAddress
                    ) {
                        latestError = `Invalid Response from ChangeNow: ${JSON.stringify(response)}`;
                        this.$log.error(latestError);
                        continue;
                    }

                    // We do this here instead of attemptSend so that the user won't receive to this address again, even if
                    // they don't swap.
                    const refundAddressBookData = {
                        address: walletAddress,
                        label: `${pair} Swap Refund (Order ${response.id})`,
                        purpose: 'changeNowRefund'
                    };

                    const sendAddressBookData = {
                        address: response.payinAddress,
                        label: `${pair} Swap (Order ${response.id})`,
                        purpose: 'changeNowSend'
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
                        chainName:this.chainName,
                        orderId: response.id,
                        fromCoin: 'FIRO',
                        toCoin: this.remoteCurrency,
                        sendAmount: bigintToString(this.firoAmount),
                        expectedAmountToReceive: response.amount,
                        expectedRate: bigintToString(this.expectedRate),
                        fromFee: bigintToString(this.firoTransactionFee),
                        expectedToFee: bigintToString(this.remoteTransactionFee),
                        status: 'waiting',
                        date: Date.now(),
                        exchangeAddress: response.payinAddress,
                        refundAddress: response.refundAddress,
                        receiveAddress: response.payoutAddress,
                        _response: response
                    };
                } else if (this.chainName === "Swapzone"){
                    const order = {
                        from:"firo",
                        to:this.remoteCurrency.toLowerCase(),
                        addressReceive: this.receiveAddress,
                        refundAddress: walletAddress,
                        amountDeposit: bigintToString(this.firoAmount),
                        quotaId: this.quotaId
                    };

                    this.$log.info("Posting order: %O", order);

                    let r;
                    try {
                        r = await this.swapzone.postOrder(order);
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
                        response.refundAddress !== walletAddress ||
                        response.addressReceive !== this.receiveAddress
                    ) {
                        latestError = `Invalid Response from Swapzone: ${JSON.stringify(response)}`;
                        this.$log.error(latestError);
                        continue;
                    }

                    // We do this here instead of attemptSend so that the user won't receive to this address again, even if
                    // they don't swap.
                    const refundAddressBookData = {
                        address: walletAddress,
                        label: `${pair} Swap Refund (Order ${response.id})`,
                        purpose: 'SwapzoneRefund'
                    };

                    const sendAddressBookData = {
                        address: response.addressDeposit,
                        label: `${pair} Swap (Order ${response.id})`,
                        purpose: 'SwapzoneSend'
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
                        chainName:this.chainName,
                        orderId: response.id,
                        fromCoin: 'FIRO',
                        toCoin: this.remoteCurrency,
                        sendAmount: bigintToString(this.firoAmount),
                        expectedAmountToReceive: response.amountEstimated,
                        expectedRate: bigintToString(this.expectedRate),
                        fromFee: bigintToString(this.firoTransactionFee),
                        expectedToFee: bigintToString(this.remoteTransactionFee),
                        status: 'waiting',
                        date: Date.now(),
                        exchangeAddress: response.addressDeposit,
                        refundAddress: response.refundAddress,
                        receiveAddress: response.addressReceive,
                        _response: response
                    };
                } else if (this.chainName === "Exolix"){
                    const order = {
                        coin_from:"FIRO",
                        coin_to:this.remoteCurrency,
                        destination_address: this.receiveAddress,
                        deposit_amount: bigintToString(this.firoAmount),
                        refund_address: walletAddress
                    };

                    this.$log.info("Posting order: %O", order);

                    let r;
                    try {
                        r = await this.exolix.postOrder(order);
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
                        response.refund_address !== walletAddress || response.destination_address !== this.receiveAddress
                    ) {
                        latestError = `Invalid Response from Exolix: ${JSON.stringify(response)}`;
                        this.$log.error(latestError);
                        continue;
                    }

                    // We do this here instead of attemptSend so that the user won't receive to this address again, even if
                    // they don't swap.
                    const refundAddressBookData = {
                        address: walletAddress,
                        label: `${pair} Swap Refund (Order ${response.id})`,
                        purpose: 'ExolixRefund'
                    };

                    const sendAddressBookData = {
                        address: response.deposit_address,
                        label: `${pair} Swap (Order ${response.id})`,
                        purpose: 'ExolixSend'
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
                        chainName:this.chainName,
                        orderId: response.id,
                        fromCoin: 'FIRO',
                        toCoin: this.remoteCurrency,
                        sendAmount: bigintToString(this.firoAmount),
                        expectedAmountToReceive: response.amount_to,
                        expectedRate: bigintToString(this.expectedRate),
                        fromFee: bigintToString(this.firoTransactionFee),
                        expectedToFee: bigintToString(this.remoteTransactionFee),
                        status: 'waiting',
                        date: Date.now(),
                        exchangeAddress: response.deposit_address,
                        refundAddress: response.refund_address,
                        receiveAddress: response.destination_address,
                        _response: response
                    };
                } else { //StealthEx
                    const order = {
                        currency_from:"firo",
                        currency_to:this.remoteCurrency.toLowerCase(),
                        address_to: this.receiveAddress,
                        amount_from: bigintToString(this.firoAmount),
                        refund_address: walletAddress,
                    };

                    this.$log.info("Posting order: %O", order);

                    let r;
                    try {
                        r = await this.stealth.postOrder(order);
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
                        response.refund_address !== walletAddress ||
                        response.address_to !== this.receiveAddress
                    ) {
                        latestError = `Invalid Response from StealthEx: ${JSON.stringify(response)}`;
                        this.$log.error(latestError);
                        continue;
                    }

                    // We do this here instead of attemptSend so that the user won't receive to this address again, even if
                    // they don't swap.
                    const refundAddressBookData = {
                        address: walletAddress,
                        label: `${pair} Swap Refund (Order ${response.id})`,
                        purpose: 'StealthExRefund'
                    };

                    const sendAddressBookData = {
                        address: response.address_from,
                        label: `${pair} Swap (Order ${response.id})`,
                        purpose: 'StealthExSend'
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
                        chainName:this.chainName,
                        orderId: response.id,
                        fromCoin: 'FIRO',
                        toCoin: this.remoteCurrency,
                        sendAmount: bigintToString(this.firoAmount),
                        expectedAmountToReceive: response.amount_to,
                        expectedRate: bigintToString(this.expectedRate),
                        fromFee: bigintToString(this.firoTransactionFee),
                        expectedToFee: bigintToString(this.remoteTransactionFee),
                        status: 'waiting',
                        date: Date.now(),
                        exchangeAddress: response.address_from,
                        refundAddress: response.refund_address,
                        receiveAddress: response.address_to,
                        _response: response
                    };
                } 

                this.show = 'info';
                return;
            }

            this.show = 'error';
            this.error = latestError || 'Uh oh, something went wrong :(';
            this.$log.error(`Gave up sending to ChangeNow after 10 errors.`);
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
                    await $daemon.sendLelantus(passphrase, this.coinSwapRecord.exchangeAddress, this.firoAmount,
                        this.txFeePerKb, false);
                } else {
                    await $daemon.publicSend(passphrase, `Coin Swap FIRO-${this.remoteCurrency}`,
                        this.coinSwapRecord.exchangeAddress, this.firoAmount, this.txFeePerKb, false);
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
