<template>
    <div>
        <div class="buttons">
            <button :disabled="disabled" @click="show = 'confirm'">
                Send
            </button>
        </div>

        <Popup v-if="show !== 'button'" :margin="show !== 'wait'">
            <ConfirmStep
                v-if="show === 'confirm'"
                :label="label"
                :address="address"
                :amount="amount"
                :fee="computedTxFee"
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

import {IncorrectPassphrase, FirodErrorResponse} from "daemon/firod";
import {mapGetters} from "vuex";
import Popup from "renderer/components/shared/Popup";
import ConfirmStep from "./ConfirmStep";
import PassphraseStep from "./PassphraseStep";
import ErrorStep from "./ErrorStep";
import WaitOverlay from "renderer/components/shared/WaitOverlay";

export default {
    name: "SendFlow",

    components: {
        Popup,
        ConfirmStep,
        PassphraseStep,
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
        disabled: {
            required: true,
            type: Boolean
        },

        label: {
            required: true,
            type: String,
        },

        address: {
            required: true,
            type: String
        },

        amount: {
            required: true,
            type: Number
        },

        txFeePerKb: {
            required: true,
            type: Number
        },

        computedTxFee: {
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

    computed: {
        ...mapGetters({
            addressBook: 'AddressBook/addressBook'
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

        async attemptSend () {
            this.show = 'wait';
            const passphrase = this.passphrase;
            this.passphrase = '';

            try {
                if (this.isPrivate) {
                    const r = await $daemon.sendLelantus(passphrase, this.address, this.amount, this.txFeePerKb,
                        this.subtractFeeFromAmount, this.coinControl);

                    $store.commit('Transactions/markSpentTransaction', r.inputs);
                } else {
                    await $daemon.publicSend(passphrase, this.label, this.address, this.amount, this.txFeePerKb,
                        this.subtractFeeFromAmount, this.coinControl);
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
@import "src/renderer/styles/inputs";

.buttons {
    @include buttons-container();
}
</style>