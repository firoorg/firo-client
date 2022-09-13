<template>
    <div>
        <div class="buttons">
            <button class="solid-button unrecommended" @click="$emit('reset')">
                Reset
            </button>

            <button class="solid-button recommended" :disabled="disabled" @click="showInfo">
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
import ErrorStep from './ErrorStep';
import WaitOverlay from 'renderer/components/shared/WaitOverlay';
import ChangeAPIWorker from 'lib/changenow-api';
import StealthAPIWorker from 'lib/stealth-api';
import SwapzoneAPIWorker from 'lib/swapzone-api';
import ExolixAPIWorker from 'lib/exolix-api';
import {mapActions} from "vuex";
import {bigintToString} from "lib/convert";

export default {
    name: 'CoinSwapFlowToFiro',

    components: {
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
            exolix: null,
            orderId: '',
            exchangeAddress: '',
            error: null,
            show: 'button',
            passphrase: '',
            coinSwapRecord: null
        };
    },

    props: {
        disabled: Boolean,
        chainName: String,
        remoteCurrency: String,
        firoAmount: BigInt,
        remoteAmount: BigInt,
        firoTransactionFee: BigInt,
        refundAddress: String,
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

        cleanup(emitSuccess=true) {
            this.orderId = '';
            this.exchangeAddress = '';
            this.error = null;
            this.show = 'button';

            if (emitSuccess) this.$emit('success');
        },


        async showInfo() {
            if (this.show !== 'button') return;
            this.show = 'wait';

            const pair = `${this.remoteCurrency}-FIRO`;
            while (!window.$daemon) {
                await new Promise(r => setTimeout(r, 10));
            }
            const walletAddress = await $daemon.getUnusedAddress();

            let latestError = null;
            for (let i = 0; i < 1; i++) {
                if (this.chainName=="ChangeNow"){
                    const order ={
                        from:this.remoteCurrency.toLowerCase(),
                        to:"firo",
                        address: walletAddress,
                        refundAddress: this.refundAddress,
                        amount: bigintToString(this.remoteAmount)
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
                        response.refundAddress !== this.refundAddress ||
                        response.payoutAddress !== walletAddress
                    ) {
                        latestError = `Invalid Response from ChangeNow: ${JSON.stringify(response)}`;
                        this.$log.error(latestError);
                        continue;
                    }

                    const receiveAddressBookData = {
                        address: walletAddress,
                        label: `${pair} Swap (Order ${response.id})`,
                        purpose: 'ChangeNowReceive'
                    };
                    $store.commit('AddressBook/updateAddress', receiveAddressBookData);
                    try {
                        await $daemon.addAddressBookItem(receiveAddressBookData);
                    } catch (e) {
                        this.$log.error(`Failed to add address book item: ${e}`);
                        this.error = `Failed to add address book item: ${e}`;
                        return;
                    }

                    this.coinSwapRecord =  {
                        chainName: this.chainName,
                        orderId: response.id,
                        fromCoin: this.remoteCurrency,
                        toCoin: 'FIRO',
                        sendAmount: bigintToString(this.remoteAmount),
                        expectedAmountToReceive: bigintToString(this.firoAmount),
                        fromFee: null,
                        expectedToFee: bigintToString(this.firoTransactionFee),
                        status: 'waiting',
                        date: Date.now(),
                        exchangeAddress: response.payinAddress,
                        refundAddress: this.refundAddress,
                        receiveAddress: walletAddress,
                        expectedRate: bigintToString(this.expectedRate),
                        _response: response
                    };
                } else if (this.chainName === "StealthEx"){
                    const order = {
                        currency_from:this.remoteCurrency.toLowerCase(),
                        currency_to:"firo",
                        address_to: walletAddress,
                        amount_from: bigintToString(this.remoteAmount),
                        refund_address: this.refundAddress,
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
                        response.refund_address !== this.refundAddress ||
                        response.address_to !== walletAddress
                    ) {
                        latestError = `Invalid Response from StealthEx: ${JSON.stringify(response)}`;
                        this.$log.error(latestError);
                        continue;
                    }

                    const receiveAddressBookData = {
                        address: walletAddress,
                        label: `${pair} Swap (Order ${response.id})`,
                        purpose: 'StealthExReceive'
                    };
                    $store.commit('AddressBook/updateAddress', receiveAddressBookData);
                    try {
                        await $daemon.addAddressBookItem(receiveAddressBookData);
                    } catch (e) {
                        this.$log.error(`Failed to add address book item: ${e}`);
                        this.error = `Failed to add address book item: ${e}`;
                        return;
                    }

                    this.coinSwapRecord =  {
                        chainName: this.chainName,
                        orderId: response.id,
                        fromCoin: this.remoteCurrency,
                        toCoin: 'FIRO',
                        sendAmount: bigintToString(this.remoteAmount),
                        expectedAmountToReceive: response.amount_to,
                        fromFee: null,
                        expectedToFee: bigintToString(this.firoTransactionFee),
                        status: 'waiting',
                        date: Date.now(),
                        exchangeAddress: response.address_from,
                        refundAddress: this.refundAddress,
                        receiveAddress: response.address_to,
                        expectedRate: bigintToString(this.expectedRate),
                        _response: response
                    };
                } else if (this.chainName === "Swapzone"){
                    const order = {
                        from:this.remoteCurrency.toLowerCase(),
                        to:"firo",
                        addressReceive: walletAddress,
                        refundAddress: this.refundAddress,
                        amountDeposit: bigintToString(this.remoteAmount),
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
                        response.refundAddress !== this.refundAddress ||
                        response.addressReceive !== walletAddress
                    ) {
                        latestError = `Invalid Response from Swapzone: ${JSON.stringify(response)}`;
                        this.$log.error(latestError);
                        continue;
                    }

                    const receiveAddressBookData = {
                        address: walletAddress,
                        label: `${pair} Swap (Order ${response.id})`,
                        purpose: 'SwapzoneReceive'
                    };
                    $store.commit('AddressBook/updateAddress', receiveAddressBookData);
                    try {
                        await $daemon.addAddressBookItem(receiveAddressBookData);
                    } catch (e) {
                        this.$log.error(`Failed to add address book item: ${e}`);
                        this.error = `Failed to add address book item: ${e}`;
                        return;
                    }

                    this.coinSwapRecord =  {
                        chainName: this.chainName,
                        orderId: response.id,
                        fromCoin: this.remoteCurrency,
                        toCoin: 'FIRO',
                        sendAmount: bigintToString(this.remoteAmount),
                        expectedAmountToReceive: response.amountEstimated,
                        fromFee: null,
                        expectedToFee:bigintToString( this.firoTransactionFee),
                        status: 'waiting',
                        date: Date.now(),
                        exchangeAddress: response.addressDeposit,
                        refundAddress: this.refundAddress,
                        receiveAddress: response.addressReceive,
                        expectedRate: bigintToString(this.expectedRate),
                        _response: response
                    };
                } else if (this.chainName === "Exolix"){
                    const order = {
                        coin_from:this.remoteCurrency,
                        coin_to:"FIRO",
                        destination_address: walletAddress,
                        deposit_amount: bigintToString(this.remoteAmount),
                        refund_address: this.refundAddress
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
                        response.refund_address !== this.refundAddress ||
                        response.destination_address !== walletAddress
                    ) {
                        latestError = `Invalid Response from Exolix: ${JSON.stringify(response)}`;
                        this.$log.error(latestError);
                        continue;
                    }

                    const receiveAddressBookData = {
                        address: walletAddress,
                        label: `${pair} Swap (Order ${response.id})`,
                        purpose: 'ExolixReceive'
                    };
                    $store.commit('AddressBook/updateAddress', receiveAddressBookData);
                    try {
                        await $daemon.addAddressBookItem(receiveAddressBookData);
                    } catch (e) {
                        this.$log.error(`Failed to add address book item: ${e}`);
                        this.error = `Failed to add address book item: ${e}`;
                        return;
                    }

                    this.coinSwapRecord =  {
                        chainName: this.chainName,
                        orderId: response.id,
                        fromCoin: this.remoteCurrency,
                        toCoin: 'FIRO',
                        sendAmount: bigintToString(this.remoteAmount),
                        expectedAmountToReceive: response.amount_to,
                        fromFee: null,
                        expectedToFee: bigintToString(this.firoTransactionFee),
                        status: 'waiting',
                        date: Date.now(),
                        exchangeAddress: response.deposit_address,
                        refundAddress: response.refund_address,
                        receiveAddress: response.destination_address,
                        expectedRate: bigintToString(this.expectedRate),
                        _response: response
                    };
                }                 

                try {
                    await this.addCoinSwapRecords([this.coinSwapRecord]);
                } catch(e) {
                    this.$log.error(`Failed to add CoinSwap record: ${e}`);
                    this.show = 'error';
                    this.error = e;
                    return;
                }

                this.show = 'info';
                return;
            }

            this.show = 'error';
            this.error = latestError || 'Uh oh, something went wrong :(';
            this.$log.error(`Gave up sending the request after 10 errors.`);
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
