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
            <ConfirmStep
                v-if="show === 'confirm'"
                :label="label"
                :address="address"
                :amount="subtractFeeFromAmount ? amount - computedTxFee : amount"
                :fee="computedTxFee"
                :total="totalAmount"
                :is-private="isPrivate"
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
// $emits: success, reset

import {IncorrectPassphrase, FirodErrorResponse} from "daemon/firod";
import {mapGetters} from "vuex";
import Popup from "renderer/components/shared/Popup";
import ConfirmStep from "./ConfirmStep";
import PassphraseInput from "../shared/PassphraseInput";
import ErrorStep from "./ErrorStep";
import WaitOverlay from "renderer/components/shared/WaitOverlay";

export default {
    name: "SendFlow",

    components: {
        Popup,
        ConfirmStep,
        PassphraseInput,
        ErrorStep,
        WaitOverlay
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
        amount: Number,
        txFeePerKb: Number,
        computedTxFee: Number,
        subtractFeeFromAmount: Boolean,
        isPrivate: Boolean,
        coinControl: Array
    },

    computed: {
        ...mapGetters({
            addressBook: 'AddressBook/addressBook',
            lockedTransactions: 'Transactions/lockedTransactions',
            allowBreakingMasternodes: 'App/allowBreakingMasternodes',
            selectInputs: 'Transactions/selectInputs'
        }),

        totalAmount() {
            return this.subtractFeeFromAmount ? this.amount : this.amount + this.computedTxFee;
        }
    },

    methods: {
        goToPassphraseStep() {
            this.show = 'passphrase';
        },

        cancel() {
            this.error = null;
            this.show = 'button';
        },

        reset() {
            this.cancel();
            this.$emit('reset');
        },

        async attemptSend () {
            this.show = 'wait';
            const passphrase = this.passphrase;
            this.passphrase = '';

            try {
                if (this.isPrivate) {
                    // Under the hood we'll always use coin control because the daemon uses a very  complex stochastic
                    // algorithm that interferes with fee calculation.
                    const coinControl = this.coinControl || this.selectInputs(true, this.amount, this.txFeePerKb, this.subtractFeeFromAmount);
                    const r = await $daemon.sendLelantus(passphrase, this.address, this.amount, this.txFeePerKb,
                        this.subtractFeeFromAmount, coinControl);

                    $store.commit('Transactions/markSpentTransaction', r.inputs);
                } else {
                    if (this.coinControl && this.allowBreakingMasternodes) {
                        const lockedCoins = this.coinControl.filter(coin =>
                            this.lockedTransactions.find(tx => tx.txid === coin[0] && tx.txIndex === coin[1])
                        );
                        await $daemon.updateCoinLocks(passphrase, [], lockedCoins);
                    }

                    // Under the hood we'll always use coin control because the daemon uses a very  complex stochastic
                    // algorithm that interferes with fee calculation.
                    const coinControl = this.coinControl || this.selectInputs(false, this.amount, this.txFeePerKb, this.subtractFeeFromAmount);
                    const r = await $daemon.publicSend(passphrase, this.label, this.address, this.amount, this.txFeePerKb,
                        this.subtractFeeFromAmount, coinControl);

                    $store.commit('Transactions/markSpentTransaction', r.inputs);
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