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
import Popup from 'renderer/components/shared/Popup.vue';
import CoinSwapInfo from 'renderer/components/CoinSwapPage/CoinSwapInfo.vue';
import ErrorStep from './ErrorStep.vue';
import WaitOverlay from 'renderer/components/shared/WaitOverlay.vue';
import {bigintToString} from "lib/convert";
import {mapActions, mapGetters, mapMutations} from "vuex";
import PassphraseInput from "renderer/components/shared/PassphraseInput.vue";
import { CoinSwapApiWrapper } from 'lib/coinswap';
import ApiKeys from 'keys';

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
            coinSwapApi: null,
            error: null,
            show: 'button',
            passphrase: '',
            coinSwapRecord: null
        };
    },

    props: {
        pairInfo: Object,
        sendAmount: BigInt,
        destinationAddress: String,
        disabled: Boolean,
        isPrivate: Boolean,
        txFeePerKb: BigInt,
        firoTxFee: BigInt
    },

    created() {
        this.coinSwapApi = new CoinSwapApiWrapper(ApiKeys);
    },

    computed: mapGetters({
        isSparkAllowed: 'ApiStatus/isSparkAllowed'
    }),

    methods: {
        ...mapActions({
            addCoinSwapRecords: 'CoinSwap/addOrUpdateRecords'
        }),

        ...mapMutations({
            updateAddress: 'AddressBook/updateAddress'
        }),

        async showInfo() {
            if (!this.pairInfo) return;
            if (this.show !== 'button') return;
            this.show = 'wait';

            while (!window.$daemon) {
                await new Promise(r => setTimeout(r, 10));
            }

            const refundAddress = await $daemon.getUnusedAddress();
            const order = {
                sendAmount: this.sendAmount,
                refundAddress,
                destinationAddress: this.destinationAddress,
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

            // We do this here instead of attemptSend so that the user won't receive to this address again, even if
            // they don't swap.
            const refundAddressBookData = {
                address: orderInfo.refundAddress,
                label: `${orderInfo.provider} ${orderInfo.from}-${orderInfo.to} Swap Refund (Order ${orderInfo.orderId})`,
                purpose: `coin-swap-refund-${orderInfo.provider}`
            };

            const sendAddressBookData = {
                address: orderInfo.exchangeAddress,
                label: `${orderInfo.provider} ${orderInfo.from}-${orderInfo.to} Swap (Order ${orderInfo.orderId})`,
                purpose: `coin-swap-deposit-${orderInfo.provider}`
            };

            for (const data of [refundAddressBookData, sendAddressBookData]) {
                try {
                    await $daemon.addAddressBookItem(data);
                } catch (e) {
                    console.error(`Failed to add address book item:`);
                    console.error(e);

                    this.error = `Failed to add address book item: ${e?.message || e}`;
                    this.show = 'error';
                    return;
                }

                await this.updateAddress(data);
            }

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

            this.show = 'info';
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
                if (this.isPrivate && this.isSparkAllowed) {
                    await $daemon.spendSpark(passphrase, '', this.coinSwap.exchangeAddress, this.sendAmount, this.txFeePerKb, false);
                } else if (this.isPrivate) {
                    await $daemon.sendLelantus(passphrase, this.coinSwapRecord.exchangeAddress, this.sendAmount,
                        this.txFeePerKb, false);
                } else {
                    await $daemon.publicSend(passphrase, `Coin Swap FIRO-${this.pairInfo.to}`,
                        this.coinSwapRecord.exchangeAddress, this.sendAmount, this.txFeePerKb, false);
                }

                try {
                    await this.addCoinSwapRecords([this.coinSwapRecord]);
                } catch(e) {
                    console.error(`Failed to add CoinSwap record: ${e}`);
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
