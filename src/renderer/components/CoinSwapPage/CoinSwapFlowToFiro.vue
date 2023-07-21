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
            <CoinSwapInfo v-if="show === 'info'" :coin-swap-data="coinSwapRecord" :show-cancel="false"
                @confirm="cleanup(true)" />
        </Popup>
    </div>
</template>

<script>
// $emits: success

import Popup from 'renderer/components/shared/Popup.vue';
import CoinSwapInfo from 'renderer/components/CoinSwapPage/CoinSwapInfo.vue';
import ErrorStep from './ErrorStep.vue';
import WaitOverlay from 'renderer/components/shared/WaitOverlay.vue';
import {bigintToString} from "lib/convert";
import {mapActions, mapMutations} from "vuex";
import { CoinSwapApiWrapper } from 'lib/coinswap';
import ApiKeys from 'keys';

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
            coinSwapApi: null,
            error: null,
            show: 'button',
            coinSwapRecord: null
        };
    },

    props: {
        pairInfo: Object,
        sendAmount: BigInt,
        refundAddress: String,
        disabled: Boolean,
        isPrivate: Boolean,
        txFeePerKb: BigInt
    },

    created() {
        this.coinSwapApi = new CoinSwapApiWrapper(ApiKeys);
    },

    methods: {
        ...mapActions({
            addCoinSwapRecords: 'CoinSwap/addOrUpdateRecords'
        }),

        ...mapMutations({
            updateAddress: 'AddressBook/updateAddress'
        }),

        cleanup(emitSuccess = true) {
            this.orderId = '';
            this.exchangeAddress = '';
            this.error = null;
            this.show = 'button';

            if (emitSuccess) this.$emit('success');
        },


        async showInfo() {
            if (!this.pairInfo) return;
            if (this.show !== 'button') return;
            this.show = 'wait';

            while (!window.$daemon) {
                await new Promise(r => setTimeout(r, 10));
            }

            const receiveAddress = await $daemon.getUnusedAddress();
            const order = {
                sendAmount: this.sendAmount,
                refundAddress: this.refundAddress,
                destinationAddress: receiveAddress,
                pairInfo: this.pairInfo
            };

            console.info(`Posting CoinSwap order:`);
            console.info(order);

            let orderInfo;
            try {
                orderInfo = await this.coinSwapApi.makeOrder(order);
            } catch (e) {
                console.error('Error posting order:')
                console.error(e);

                this.error = `Error posting order: ${e?.message || e}`;
                this.show = 'error';
                return;
            }

            console.info(`Posted CoinSwap order:`);
            console.info(orderInfo);

            const receiveAddressBookData = {
                address: receiveAddress,
                label: `${orderInfo.provider} ${orderInfo.from}-${orderInfo.to} Swap (Order ${orderInfo.orderId})`,
                purpose: `coin-swap-receive-${orderInfo.provider}`
            };

            try {
                await $daemon.addAddressBookItem(receiveAddressBookData);
            } catch (e) {
                console.error(`Failed to add address book item:`);
                console.error(e);

                this.error = `Failed to add address book item: ${e?.message || e}`;
                this.show = 'error';
                return;
            }

            await this.updateAddress(receiveAddressBookData);

            this.coinSwapRecord = {
                chainName: orderInfo.provider,
                orderId: orderInfo.orderId,
                fromCoin: orderInfo.from,
                toCoin: orderInfo.to,
                sendAmount: bigintToString(orderInfo.sendAmount),
                expectedAmountToReceive: bigintToString(orderInfo.receiveAmount),
                expectedRate: bigintToString(orderInfo.rate),
                fromFee: bigintToString(this.firoTransactionFee),
                expectedToFee: bigintToString(orderInfo.fee),
                status: orderInfo.status,
                date: Date.now(),
                exchangeAddress: orderInfo.exchangeAddress,
                refundAddress: orderInfo.refundAddress,
                receiveAddress: orderInfo.destinationAddress
            };
            await this.addCoinSwapRecords([this.coinSwapRecord]);

            this.show = 'info';
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
