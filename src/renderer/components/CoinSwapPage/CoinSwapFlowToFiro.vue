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
import APIWorker from 'lib/switchain-api';
import ChangeAPIWorker from 'lib/changenow-api';
import {convertToCoin} from "lib/convert";
import {mapActions} from "vuex";
import Big from "big.js";
import {isValidAddress} from "lib/isValidAddress";

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

        // This is a decimal Number representing a whole coin amount of FIRO that will be charged as a fee.
        firoTransactionFee: {
            type: Number,
        },

        // The address that funds will be refunded at if the trade fails for some reason.
        refundAddress: {
            type: String
        },

        // The expected amount of FIRO we will receive for each remoteCurrency, as a string whole-coin amount.
        expectedRate: {
            type: Number
        }
    },

    created() {
        //this.api = new APIWorker();
        this.api = new ChangeAPIWorker();
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


        async showInfo() {
            if (this.show !== 'button') return;
            this.show = 'wait';

            const pair = `${this.remoteCurrency}-FIRO`;
            while (!window.$daemon) {
                await new Promise(r => setTimeout(r, 10));
            }
            const walletAddress = await $daemon.getUnusedAddress();

            let latestError = null;
            for (let i = 0; i < 10; i++) {
                // const marketInfo = await this.api.getMarketInfo();
                // if (marketInfo.error) {
                //     latestError = `Error fetching market info: ${marketInfo.error}`;
                //     this.$log.error(latestError);
                //     await new Promise(r => setTimeout(r, 1e3));
                //     continue;
                // }

                // const pairInfo = marketInfo.response.find(mi => mi.pair === pair);
                // if (!pairInfo) {
                //     this.show = 'error';
                //     this.error = `Pair ${pair} not found in Switchain markets`;
                //     return;
                // }

                const order ={
                    from:this.remoteCurrency.toLowerCase(),
                    to:"firo",
                    address: walletAddress,
                    refundAddress: this.refundAddress,
                    amount: this.remoteAmount

                    //pair: `${this.remoteCurrency}-FIRO`,
                    //fromAmount: this.remoteAmount,
                    //toAddress: walletAddress,
                    //toAmount: this.firoAmount,
                    //refundAddress: this.refundAddress,
                    //signature: pairInfo.signature
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
                    //!Big(response.fromAmount).eq(this.remoteAmount) ||
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
                    purpose: 'coinswapReceive'
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
                    orderId: response.id,
                    fromCoin: this.remoteCurrency,
                    toCoin: 'FIRO',
                    sendAmount: this.remoteAmount,
                    expectedAmountToReceive: this.firoAmount,
                    fromFee: null,
                    expectedToFee: this.firoTransactionFee,
                    status: 'waiting',
                    date: Date.now(),
                    exchangeAddress: response.payinAddress,
                    refundAddress: this.refundAddress,
                    receiveAddress: walletAddress,
                    expectedRate: this.expectedRate,
                    _response: response
                };

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
            this.$log.error(`Gave up sending to Switchain after 10 errors.`);
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
