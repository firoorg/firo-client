<template>
    <div>
        <div class="buttons">
            <button :disabled="!selectedCoin || disabled" @click="show = 'confirm'">
                Exchange
            </button>
        </div>

        <Popup v-if="show !== 'button'" :margin="show !== 'wait'">
            <QRCodeStep v-if="show === 'info'" :orderID="orderID" :address="exchangeAddress" :amount="amount" :selectedCoin="selectedCoin" @cancel="cancel(true)" />
            <ConfirmStep
                v-if="show === 'confirm'"
                :label="label"
                :address="address"
                :amount="amount"
                :fee="transactionFee"
                :total="totalAmount"
                :is-private="isPrivate"
                @cancel="cancel()"
                @confirm="goToPassphraseStep()"
            />
            <PassphraseStep v-if="show === 'passphrase'" :error="error" v-model="passphrase" @cancel="cancel()" @confirm="attemptSend" />
            <WaitOverlay v-if="show === 'wait'" />
            <ErrorStep v-if="show === 'error'" :error="error" @ok="cancel()" />
        </Popup>
    </div>
</template>

<script>
// $emits: success

import {FirodErrorResponse, IncorrectPassphrase} from 'daemon/firod';
import Popup from '../Popup';
import QRCodeStep from './QRCodeStep';
import ConfirmStep from './ConfirmStep';
import PassphraseStep from './PassphraseStep';
import ErrorStep from './ErrorStep';
import WaitOverlay from 'renderer/components/WaitOverlay';
import APIWorker from 'renderer/api/switchain-api';
import TIR from 'lib/tir';
import { getEventBus } from 'renderer/utils/eventBus';

const EventBus = getEventBus('coin-swap');

export default {
    name: 'SendFlow',

    components: {
        Popup,
        QRCodeStep,
        ConfirmStep,
        PassphraseStep,
        ErrorStep,
        WaitOverlay
    },

    data() {
        return {
            api: null,
            TIR: new TIR('coin-swap'),
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

        swapType: {
            required: true,
            type: String
        },

        label: {
            required: true,
            type: String
        },

        currentPair: {
            required: true,
            type: String
        },

        selectedCoin: {
            required: false,
            type: String
        },

        address: {
            required: true,
            type: String
        },

        amount: {
            required: true,
            type: Number
        },

        satoshiAmount: {
            required: true,
            type: Number
        },

        txFeePerKb: {
            required: true,
            type: Number
        },

        transactionFee: {
            required: true,
            type: Number
        },

        subtractFeeFromAmount: {
            required: true,
            type: Boolean
        },

        isPrivate: {
            required: true,
            type: Boolean
        },

        coinControl: {
            required: false,
            type: Array // CoinControl[]
        }
    },

    created() {
        this.api = new APIWorker();
    },

    computed: {
        totalAmount() {
            return this.subtractFeeFromAmount ? this.amount : this.amount + this.transactionFee;
        }
    },

    methods: {
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

            const walletAddress = await $daemon.getUnusedAddress();

            const params = {
                pair: this.currentPair,
                toAddress: this.swapType === 'from' ? this.address : walletAddress,
                refundAddress: this.swapType === 'from' ? walletAddress : this.address,
                fromAmount: String(this.totalAmount)
            };

            try {
                const { error, response } = await this.api.postOrder(params);

                if (this.swapType === 'from') {
                    if (this.isPrivate) {
                        await $daemon.privateSend(passphrase, 'Coin swap: ' + this.label, response.exchangeAddress, this.satoshiAmount, this.subtractFeeFromAmount, this.coinControl);
                    } else {
                        await $daemon.publicSend(
                            passphrase,
                            'Coin swap: ' + this.label,
                            response.exchangeAddress,
                            this.satoshiAmount,
                            this.txFeePerKb,
                            this.subtractFeeFromAmount,
                            this.coinControl
                        );
                    }
                } else {
                    this.orderID = response.orderId;
                    this.exchangeAddress = response.exchangeAddress;
                }

                let historyData = this.TIR.readFile();

                const newItem = {
                    id: response.orderId,
                    fromCoin: this.swapType === 'from' ? 'FIRO' : this.selectedCoin,
                    toCoin: this.swapType === 'from' ? this.selectedCoin : 'FIRO',
                    sentAmount: response.fromAmount,
                    receivedAmount: response.rate ? response.fromAmount * response.rate + this.transactionFee : '-',
                    fee: this.transactionFee,
                    status: 'waiting',
                    pair: this.label,
                    date: Date.now(),
                    ...response
                };

                historyData = {
                    ...historyData,
                    [response.orderId]: newItem
                };

                this.TIR.writeFile(historyData);

                EventBus.$emit('refresh-table');
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

            if (this.swapType === 'to') {
                this.show = 'info';
            } else {
                this.show = 'button';
                this.$emit('success');
            }

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
