<template>
    <div>
        <div class="buttons">
            <button :disabled="disabled" @click="show = 'confirm'">
                Exchange
            </button>
        </div>

        <Popup v-if="show !== 'button'" :margin="show !== 'wait'">
            <ConfirmStep
                v-if="show === 'confirm'"
                from-currency="FIRO"
                :to-currency="remoteCurrency"
                :address="receiveAddress"
                :amount-from="convertToCoin(firoAmount)"
                :amount-to="remoteAmount"
                :fee-from="convertToCoin(firoTransactionFee)"
                :fee-to="remoteTransactionFee"
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
import ConfirmStep from './ConfirmStep';
import PassphraseStep from './PassphraseStep';
import ErrorStep from './ErrorStep';
import WaitOverlay from 'renderer/components/WaitOverlay';
import APIWorker from 'renderer/api/switchain-api';
import TIR from 'lib/tir';
import { getEventBus } from 'renderer/utils/eventBus';
import {convertToCoin} from "lib/convert";
import {isValidAddress} from "lib/isValidAddress";

const EventBus = getEventBus('coin-swap');

export default {
    name: 'CoinSwapFlowFromFiro',

    components: {
        Popup,
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
            passphrase: '',
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
        }
    },

    created() {
        this.api = new APIWorker();
    },

    methods: {
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

            const walletAddress = await $daemon.getUnusedAddress();

            try {
                // The API accepts a signature to commit to a specific offer, but it's only valid for 60s and is
                // therefore unusable practically.
                const { error, response } = await this.api.postOrder({
                    pair: `XZC-${this.remoteCurrency}`,
                    toAddress: this.receiveAddress,
                    refundAddress: walletAddress,
                    fromAmount: convertToCoin(this.firoAmount),
                });
                if (error || !response) throw error;

                // Sanity check response
                if (
                    response.fromAmount !== convertToCoin(this.firoAmount) ||
                    response.refundAddress !== walletAddress ||
                    !isValidAddress(response.exchangeAddress, 'main')
                ) {
                    this.$log.error("Invalid Response: %O", response);
                    throw 'invalid response from SwitchChain';
                }

                /*
                if (!this.isPrivate) {
                    await $daemon.publicSend(passphrase, `Coin Swap FIRO-${this.remoteCurrency}`,
                        response.exchangeAddress, this.firoAmount, this.txFeePerKb,false);
                } else if (this.isLelantusAllowed) {
                    await $daemon.sendLelantus(passphrase, response.exchangeAddress, this.firoAmount, this.txFeePerKb,
                        false);
                } else {
                    await $daemon.sendSigma(passphrase, `Coin Swap FIRO-${this.remoteCurrency}`,
                        response.exchangeAddress, this.firoAmount, false);
                }*/

                let historyData = this.TIR.readFile();

                const newItem = {
                    id: response.orderId,
                    fromCoin: 'FIRO',
                    toCoin: this.remoteCurrency,
                    sentAmount: response.fromAmount,
                    receivedAmount: response.rate ? response.fromAmount * response.rate + this.transactionFee : '-',
                    localFee: this.firoTransactionFee,
                    remoteFee: this.remoteTransactionFee,
                    status: 'waiting',
                    date: Date.now(),
                    response
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
