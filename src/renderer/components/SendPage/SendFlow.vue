<template>
    <div class="send-flow">
        <div class="buttons">
            <button id="reset-button" class="solid-button unrecommended" :disabled="show !== 'button'" @click="reset()">
                Reset
            </button>

            <button v-if= "this.$parent.isSparkAllowed && this.$parent.availablePrivate > 0" id="send-button" class="solid-button recommended" :disabled="disabled" @click="show = 'lelantustospark'">
                Send
            </button>

            <button v-else-if= "!isPrivate && !this.$parent.isSparkAddr" id="send-button" class="solid-button recommended" :disabled="disabled" @click="show = 'goprivate'">
                Send
            </button>

            <button v-else= "" id="send-button" class="solid-button recommended" :disabled="disabled" @click="show = 'confirm'">
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
            <GoPrivate
                v-else-if="show === 'goprivate'"
                @ignore="goToConfirmStep()"
                @go_private="cancel()"
            />
            <LelantusToSpark
                v-else-if="show === 'lelantustospark'"
                @migrate="goToPassphraseStep()"
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
import Popup from "renderer/components/shared/Popup";
import ElysiumConfirmStep from "./ElysiumConfirmStep";
import ConfirmStep from "./ConfirmStep";
import PassphraseInput from "../shared/PassphraseInput";
import ErrorStep from "./ErrorStep";
import WaitOverlay from "renderer/components/shared/WaitOverlay";
import GoPrivate from "./GoPrivate";
import LelantusToSpark from "./LelantusToSpark";

export default {
    name: "SendFlow",

    components: {
        Popup,
        ElysiumConfirmStep,
        ConfirmStep,
        PassphraseInput,
        ErrorStep,
        WaitOverlay,
        GoPrivate,
        LelantusToSpark
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
            tokenData: 'Elysium/tokenData'
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

        async attemptSend () {
            this.show = 'wait';
            const passphrase = this.passphrase;
            this.passphrase = '';

            try {
                if (this.asset != 'FIRO') {
                    const id = this.tokenData[this.asset].id;

                    try {
                        await $daemon.sendElysium(passphrase, id, this.address, this.amount);
                    } catch (e) {
                        if (!e.message.includes('Insufficient funds')) throw e;

                        await $daemon.recoverElysium(passphrase);
                        await $daemon.sendElysium(passphrase, id, this.address, this.amount);
                    }
                } else if (this.$parent.isSparkAllowed && this.$parent.availablePrivate > 0) {
                    await $daemon.lelantusToSpark(passphrase);
                } else if (this.isPrivate && !this.$parent.isSparkAllowed) {
                    // Under the hood we'll always use coin control because the daemon uses a very  complex stochastic
                    // algorithm that interferes with fee calculation.
                    const coinControl = this.coinControl || this.selectInputs(true, this.amount, this.txFeePerKb, this.subtractFeeFromAmount);
                    await $daemon.sendLelantus(passphrase, this.address, this.amount, this.txFeePerKb,
                        this.subtractFeeFromAmount, coinControl);
                } else if (this.isPrivate && this.$parent.isSparkAllowed) {
                    // Under the hood we'll always use coin control because the daemon uses a very  complex stochastic
                    // algorithm that interferes with fee calculation.
                    // const coinControl = this.coinControl || this.selectInputs(true, this.amount, this.txFeePerKb, this.subtractFeeFromAmount);
                    const coinControl = this.coinControl;
                    await $daemon.spendSpark(passphrase, this.label, this.address, this.amount, this.txFeePerKb,
                        this.subtractFeeFromAmount, coinControl);
                } 
                else if (!this.isPrivate && this.$parent.isSparkAllowed && this.$parent.isSparkAddr) {
                    // Under the hood we'll always use coin control because the daemon uses a very  complex stochastic
                    // algorithm that interferes with fee calculation.
                    const coinControl = this.coinControl || this.selectInputs(false, this.amount, this.txFeePerKb, this.subtractFeeFromAmount);
                    await $daemon.mintSpark(passphrase, this.label, this.address, this.amount, this.txFeePerKb,
                        this.subtractFeeFromAmount, coinControl);
                } else {
                    if (this.coinControl && this.allowBreakingMasternodes) {
                        const lockedCoins = this.coinControl.filter(coin =>
                            this.lockedUTXOs.find(tx => tx.txid === coin[0] && tx.index === coin[1])
                        );
                        if (lockedCoins.length) await $daemon.updateCoinLocks(passphrase, [], lockedCoins);
                    }

                    // Under the hood we'll always use coin control because the daemon uses a very  complex stochastic
                    // algorithm that interferes with fee calculation.
                    const coinControl = this.coinControl || this.selectInputs(false, this.amount, this.txFeePerKb, this.subtractFeeFromAmount);
                    await $daemon.publicSend(passphrase, this.label, this.address, this.amount, this.txFeePerKb,
                        this.subtractFeeFromAmount, coinControl);
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