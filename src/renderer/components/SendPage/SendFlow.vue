<template>
    <div class="send-flow">
        <div class="buttons">
            <button id="reset-button" class="solid-button unrecommended" :disabled="show !== 'button'" @click="reset()">
                Reset
            </button>

            <button id="send-button" class="solid-button recommended" :disabled="disabled" @click="show = 'confirm'">
                Send
            </button>
        </div>

        <Popup v-if="show !== 'button'" :margin="show !== 'wait'">
            <ElysiumConfirmStep
                v-if="asset != 'FIRO' && show === 'confirm'"
                :asset="asset"
                :label="label"
                :address="address"
                :amount="amount"
                @cancel="cancel()"
                @confirm="goToPassphraseStep()"
            />
            <ConfirmStep
                v-else-if="show === 'confirm'"
                :label="label"
                :address="address"
                :amount="subtractFeeFromAmount ? amount - computedTxFee : amount"
                :fee="computedTxFee"
                :total="totalAmount"
                :is-private="isPrivate"
                @cancel="cancel()"
                @confirm="goToPassphraseStep()"
            />
            <PassphraseInput v-else-if="show === 'passphrase'" :error="error" v-model="passphrase" @cancel="cancel()" @confirm="attemptSend" />
            <WaitOverlay v-else-if="show === 'wait'" />
            <ErrorStep v-else-if="show === 'error'" :error="error" @ok="cancel()" />
        </Popup>
    </div>
</template>

<script>
// $emits: success, reset

import {IncorrectPassphrase, FirodErrorResponse} from "daemon/firod";
import {mapGetters} from "vuex";
import Popup from "renderer/components/shared/Popup.vue";
import ElysiumConfirmStep from "./ElysiumConfirmStep.vue";
import ConfirmStep from "./ConfirmStep.vue";
import PassphraseInput from "../shared/PassphraseInput.vue";
import ErrorStep from "./ErrorStep.vue";
import WaitOverlay from "renderer/components/shared/WaitOverlay.vue";
import { isValidSparkAddress } from "lib/isValidAddress";

export default {
    name: "SendFlow",

    components: {
        Popup,
        ElysiumConfirmStep,
        ConfirmStep,
        PassphraseInput,
        ErrorStep,
        WaitOverlay,
    },

    data() {
        return {
            error: null,
            show: 'button',
            passphrase: ''
        }
    },

    props: {
        disabled: Boolean,
        label: String,
        address: String,
        amount: BigInt,
        txFeePerKb: BigInt,
        computedTxFee: BigInt,
        subtractFeeFromAmount: Boolean,
        isPrivate: Boolean,
        coinControl: Array,
        asset: String | Number
    },

    computed: {
        ...mapGetters({
            addressBook: 'AddressBook/addressBook',
            lockedUTXOs: 'Transactions/lockedUTXOs',
            allowBreakingMasternodes: 'App/allowBreakingMasternodes',
            selectInputs: 'Transactions/selectInputs',
            tokenData: 'Elysium/tokenData',
            currentBlockHeight: 'ApiStatus/currentBlockHeight',
            lelantusGracefulPeriod: 'ApiStatus/lelantusGracefulPeriod',
            isSparkAllowed: 'ApiStatus/isSparkAllowed',
            network: 'ApiStatus/network'
        }),

        totalAmount() {
            return this.subtractFeeFromAmount ? this.amount : this.amount + this.computedTxFee;
        }
    },

    methods: {
        goToPassphraseStep() {
            this.show = 'passphrase';
        },

        goToConfirmStep() {
            this.show = 'confirm';
        },

        cancel() {
            this.error = null;
            this.show = 'button';
        },

        reset() {
            this.cancel();
            this.$emit('reset');
        },

        async attemptSend() {
            this.show = 'wait';
            const passphrase = this.passphrase;
            this.passphrase = '';

            try {
                // Under the hood we'll always use coin control because the daemon uses a very  complex stochastic
                // algorithm that interferes with fee calculation.
                if (this.asset == 'FIRO') {
                    if (!this.isPrivate) {
                        const coinControl = this.coinControl || this.selectInputs('public', this.amount, this.txFeePerKb, this.subtractFeeFromAmount);

                        if (isValidSparkAddress(this.address, this.network))
                            await $daemon.mintSpark(passphrase, this.label, this.address, this.amount, this.txFeePerKb, this.subtractFeeFromAmount, coinControl);
                        else
                            await $daemon.publicSend(passphrase, this.label, this.address, this.amount, this.txFeePerKb,
                                this.subtractFeeFromAmount, coinControl);
                    } else if (this.isSparkAllowed) {
                        const coinControl = this.coinControl || this.selectInputs('spark', this.amount, this.txFeePerKb, this.subtractFeeFromAmount);
                        await $daemon.spendSpark(passphrase, this.label, this.address, this.amount, this.txFeePerKb,
                            this.subtractFeeFromAmount, coinControl);
                    } else {
                        const coinControl = this.coinControl || this.selectInputs('lelantus', this.amount, this.txFeePerKb, this.subtractFeeFromAmount);
                        await $daemon.sendLelantus(passphrase, this.label, this.address, this.amount, this.txFeePerKb,
                            this.subtractFeeFromAmount, coinControl);

                    }
                } else {
                    const id = this.tokenData[this.asset].id;

                    try {
                        await $daemon.sendElysium(passphrase, id, this.address, this.amount);
                    } catch (e) {
                        if (!e.message.includes('Insufficient funds')) throw e;

                        await $daemon.recoverElysium(passphrase);
                        await $daemon.sendElysium(passphrase, id, this.address, this.amount);
                    }
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

            if (this.label) {
                if (this.addressBook[this.address]) {
                    if (this.addressBook[this.address].purpose === 'send') {
                        const item = {
                            address: this.address,
                            label: this.addressBook[this.address].label,
                            purpose: 'send'
                        };

                        await $daemon.updateAddressBookItem(item, this.label);
                        $store.commit('AddressBook/updateAddress', {...item, label: this.label});
                    }
                } else {
                    const item = {
                        address: this.address,
                        label: this.label,
                        purpose: 'send'
                    };

                    await $daemon.addAddressBookItem(item);
                    $store.commit('AddressBook/updateAddress', item);
                }
            }

            this.error = null;
            this.show = 'button';
            this.$emit('success');
        },

    }
}
</script>

<style scoped lang="scss">
.buttons {
    display: flex;
    justify-content: space-evenly;
}
</style>