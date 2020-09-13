<template>
    <section
        class="send-zcoin-form"
        :class="privateOrPublic + '-send'"
    >
        <div v-scrollable>
            <form class="send">
                <div class="grid">
                    <div class="form">
                        <header>
                            <h2>
                                Send Zcoin {{ privateOrPublic[0].toUpperCase() + privateOrPublic.substr(1) }}ly
                            </h2>
                        </header>

                        <p
                            v-if="privateOrPublic === 'public'"
                            class="description"
                        >
                            Zcoin you send with Public Send will be visible by everyone. Maybe you want to use
                            Private Send instead?
                        </p>

                        <p
                            v-else
                            class="description"
                        >
                            No one will know the origin of Zcoin you send privately. Note that you may only send
                            multiples of 0.05 XZC.
                        </p>


                        <fieldset>
                            <div class="field">
                                <label for="label">
                                    {{ $t('send.public.detail-public-send.label__label') }}
                                </label>

                                <div class="control">
                                    <input
                                        id="label"
                                        ref="label"
                                        v-model.trim="label"
                                        v-focus
                                        type="text"
                                        name="label"
                                        tabindex="1"
                                        :placeholder="$t('send.public.detail-public-send.placeholder__label')"
                                    />
                                </div>
                            </div>

                            <div class="field">
                                <label for="address">
                                    {{ $t('send.public.detail-public-send.label__address') }}
                                </label>

                                <div class="control">
                                    <input
                                        id="address"
                                        ref="address"
                                        v-model="address"
                                        v-validate.initial="'zcoinAddress'"
                                        v-tooltip="getValidationTooltip('address')"
                                        type="text"
                                        name="address"
                                        tabindex="2"
                                        :placeholder="$t('send.public.detail-public-send.placeholder__address')"
                                    />
                                </div>
                                <div class="addressbook">
                                    <u><a
                                        :style="{ cursor: 'pointer'}"
                                        @click="openAddressBook()"
                                    >
                                        Open Address Book</a></u>
                                </div>
                            </div>

                            <div class="field amount-field">
                                <label for="amount">
                                    {{ $t('send.public.detail-public-send.label__amount') }}
                                </label>

                                <div class="control">
                                    <input
                                        id="amount"
                                        ref="amount"
                                        v-model="amount"
                                        v-validate.initial="amountValidations"
                                        v-tooltip="getValidationTooltip('amount')"
                                        type="text"
                                        name="amount"
                                        class="amount"
                                        tabindex="3"
                                        :placeholder="`Enter amount to send ${privateOrPublic}ly`"
                                    />
                                    <div class="prefix">
                                        XZC
                                    </div>
                                </div>
                                <div class="control">
                                    <div class="select-custom-inputs">
                                        <u>
                                            <a :style="{ cursor: 'pointer'}" @click="selectCustomInputs()">
                                                Select Custom Inputs
                                            </a>
                                        </u>
                                    </div>

                                    <div v-show="privateOrPublic === 'public'" class="select-fee">
                                        <input type="checkbox" id="use-custom-fee-checkbox" v-model="useCustomFee" />
                                        <label>Use a Custom Transaction Fee</label>
                                        <div v-show="useCustomFee">
                                            <input
                                                type="number"
                                                id="custom-fee"
                                                v-model.number="txFeePerKb"
                                                name="txFeePerKb"
                                                v-validate.initial="'integer|between:0,10000'"
                                            />
                                            <label>satoshis/kb</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="subtract-fee-from-amount-checkbox">
                                    <input
                                        v-model="subtractFeeFromAmount"
                                        id="subtract-fee-from-amount-checkbox"
                                        type="checkbox"
                                        name="subtractFeeFromAmount"
                                        :checked="privateOrPublic === 'private'"
                                    />
                                    
                                    <label for="subtractFeeFromAmount">
                                        Take Transaction Fee From Amount
                                    </label>
                                </div>

                                <div class="amount-available">
                                    <div v-if="coinControlSelectedAmount > 0">
                                        {{ convertToCoin(coinControlSelectedAmount ) }} XZC selected in coin control for
                                        {{ privateOrPublic }} send.
                                    </div>
                                    {{ convertToCoin(availableBalance) }} XZC available for {{ privateOrPublic }} send.
                                    <div v-if="unavailableBalance > 0">
                                        ({{ convertToCoin(unavailableBalance ) }} XZC in pending,
                                        {{ privateOrPublic === 'private' ? 'public' : 'private' }}, and locked balances
                                        unavailable.)
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <div class="totals">
                        <div class="field amount">
                            <label>
                                Recipient will receive:
                            </label>

                            <div
                                v-if="transactionFee"
                                class="value"
                            >
                                {{ convertToCoin(amountToReceive) }} XZC
                            </div>

                            <div
                                v-else
                                class="value"
                            >
                            </div>
                        </div>

                        <div class="field fee">
                            <label>
                                Transaction fee:
                            </label>

                            <div
                                v-if="transactionFee"
                                class="value"
                            >
                                {{ convertToCoin(transactionFee) }} XZC
                            </div>
                            <div
                                v-else
                                class="value"
                            >
                            </div>
                        </div>

                        <div class="field total">
                            <label>
                                Total:
                            </label>

                            <div
                                v-if="transactionFee"
                                class="value"
                            >
                                {{ convertToCoin(totalAmount) }} XZC
                            </div>

                            <div
                                v-else
                                class="value"
                            >
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="totalAmountExceedsBalance"
                        class="total-amount-exceeds-balance"
                    >
                        Amount (including fees) exceeds available balance.
                    </div>

                    <div class="buttons">
                        <base-button
                            v-if="['confirm', 'passphrase', 'incorrectPassphrase', 'error'].includes(sendPopoverStep)"
                            id="cancel-button"
                            color="red"
                            :is-dark="true"
                            :is-outline="true"
                            @click.prevent="closeSendPopover"
                        >
                            Cancel
                        </base-button>

                        <v-popover
                            :open="sendPopoverStep !== 'initial'"
                            placement="top-end"
                            popover-class="tooltip popover multi-step-popover"
                            class="send-button-popover-container"
                            trigger="manually"
                            :auto-hide="false"
                            :handle-resize="true"
                        >
                            <base-button
                                v-if="sendPopoverStep === 'initial'"
                                id="send-button"
                                color="green"
                                class="expanded"
                                :disabled="!canBeginSend"
                                @click.prevent="beginWaitToConfirmStep"
                            >
                                Send
                            </base-button>

                            <circular-timer
                                v-else-if="sendPopoverStep === 'waitToConfirm'"
                                @complete="beginConfirmStep"
                            />

                            <base-button
                                v-else-if="sendPopoverStep === 'confirm'"
                                id="confirm-button"
                                color="green"
                                @click.prevent="beginPassphraseStep"
                            >
                                Confirm
                            </base-button>

                            <base-button
                                v-else-if="sendPopoverStep === 'passphrase'"
                                id="confirm-passphrase-send-button"
                                color="green"
                                @click.prevent="attemptSend"
                            >
                                Send
                            </base-button>

                            <div
                                v-else-if="sendPopoverStep === 'waitForReply'"
                                class="wait-for-reply-icon"
                            >
                                ⧗
                            </div>

                            <base-button
                                v-else-if="sendPopoverStep === 'incorrectPassphrase'"
                                id="try-again-button"
                                color="green"
                                @click.prevent="beginPassphraseStep"
                            >
                                Try Again
                            </base-button>

                            <div
                                v-else-if="sendPopoverStep === 'complete'"
                                class="ok-icon"
                            >
                                ✓
                            </div>

                            <template slot="popover">
                                <send-step-confirm
                                    v-if="['waitToConfirm', 'confirm'].includes(sendPopoverStep)"
                                    :label="label"
                                    :address="address"
                                    :amount="amountToReceive"
                                    :fee="transactionFee"
                                />

                                <send-step-passphrase
                                    v-else-if="sendPopoverStep === 'passphrase'"
                                    v-model="passphrase"
                                    @onEnter="attemptSend"
                                />

                                <send-step-wait-for-reply
                                    v-else-if="sendPopoverStep === 'waitForReply'"
                                />

                                <send-step-error
                                    v-else-if="sendPopoverStep === 'error'"
                                    :error-message="errorMessage"
                                />

                                <send-step-incorrect-passphrase
                                    v-else-if="sendPopoverStep === 'incorrectPassphrase'"
                                />

                                <send-step-complete
                                    v-else-if="sendPopoverStep === 'complete'"
                                />
                            </template>
                        </v-popover>
                    </div>
                </div>
            </form>
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex';

import SendStepConfirm from './SendSteps/Confirm';
import SendStepPassphrase from "./SendSteps/Passphrase";
import SendStepWaitForReply from './SendSteps/WaitForReply';
import SendStepIncorrectPassphrase from './SendSteps/IncorrectPassphrase';
import SendStepError from './SendSteps/Error';
import SendStepComplete from './SendSteps/Complete';
import CircularTimer from "renderer/components/Icons/CircularTimer";

import {IncorrectPassphrase, ZcoindErrorResponse} from 'daemon/zcoind';
import {isValidAddress} from 'lib/isValidAddress';
import {convertToSatoshi, convertToCoin} from 'lib/convert';

export default {
    name: 'Send',

    components: {
        CircularTimer,
        SendStepConfirm,
        SendStepPassphrase,
        SendStepWaitForReply,
        SendStepIncorrectPassphrase,
        SendStepError,
        SendStepComplete
    },

    inject: [
        '$validator'
    ],

    data () {
        return {
            label: this.$route.query.label || '',
            amount: this.$route.query.amount || '',
            address: this.$route.query.address || '',
            subtractFeeFromAmount: true,
            passphrase: '',

            errorMessage: '',

            // Valid progressions are:
            //
            // initial -> waitToConfirm
            // waitToConfirm -> confirm
            // confirm -> initial | passphrase
            // passphrase -> initial | incorrectPassphrase | error | complete
            // error -> initial
            // incorrectPassphrase -> initial | passphrase
            // complete -> initial
            sendPopoverStep: 'initial',

            useCustomFee: false,
            txFeePerKb: 1,

            // This is the total, computed transaction fee.
            transactionFee: 0,

            // This is set if error -6 occurs during fee calculation.
            totalAmountExceedsBalance: false,
        }
    },

    computed: {
        ...mapGetters({
            network: 'ApiStatus/network',
            availableXzc: 'Balance/availableXzc',
            availableZerocoin: 'Balance/availableZerocoin',
            totalBalance: 'Balance/total',
            maxPrivateSend: 'Balance/maxPrivateSend',
            selectedUtxos: 'ZcoinPayment/selectedInputs',
            addressBook: 'Transactions/addressBook',
            addressBookStt: 'App/openAddressBook'
        }),

        // Return either 'private' or 'public', depending on whether the user is intending to make a private or a public
        // send.
        privateOrPublic () {
            if (this.$route.path === '/send/public') {
                return 'public';
            } else {
                return 'private';
            }
        },

        unavailableBalance () {
            return this.totalBalance - this.availableBalance;
        },

        availableBalance () {
            return this.privateOrPublic === 'private' ? this.availableZerocoin : this.availableXzc;
        },

        // This is the amount the user entered in satoshis.
        satoshiAmount () {
            return convertToSatoshi(this.amount);
        },

        // This is the amount the user will receive. It may be less than satoshiAmount.
        amountToReceive () {
            return this.subtractFeeFromAmount ? this.satoshiAmount - this.transactionFee : this.satoshiAmount;
        },

        // This is the total amount that will be sent, including transaction fee.
        totalAmount () {
            return this.subtractFeeFromAmount ? this.satoshiAmount : this.satoshiAmount + this.transactionFee;
        },

        // We can begin the send if the fee has been shown and the form is valid.
        canBeginSend () {
            return this.isValidated && this.transactionFee > 0 && !this.totalAmountExceedsBalance;
        },

        isValidated () {
            // this.errors was already calculated when amount and address were entered.
            return !!(this.amount && this.address && this.txFeePerKb && !this.validationErrors.items.length);
        },

        coinControlSelectedAmount() {
            var selectedAmount = 0;
            if (this.selectedUtxos) {
                this.selectedUtxos.forEach(element => {
                        selectedAmount += element.amount;
                });
            }
            return selectedAmount;
        },

        amountValidations () {
            return this.privateOrPublic === 'private' ?
                'amountIsWithinAvailableBalance|privateAmountIsValid|privateAmountIsWithinBounds|privateAmountDoesntViolateInputLimits'
                :
                'amountIsWithinAvailableBalance|publicAmountIsValid'
        },

        getValidationTooltip () {
            return (fieldName) => ({
                content: this.validationErrors.first(fieldName),
                trigger: 'manual',
                boundariesElement: 'body',
                offset: 8,
                placement: 'left',
                classes: 'error',
                show: true
            })
        }
    },

    watch: {
        $route(to) {
            this.address = to.query.address || '';
            this.label = to.query.label || '';
            this.amount = to.query.amount || '';
        },

        txFeePerKb: {
            handler: 'maybeShowFee',
            immediate: true
        },

        useCustomFee() {
            if (!this.useCustomFee) {
                this.txFeePerKb = 1;
            }
        },

        amount: {
            handler: 'maybeShowFee',
            immediate: true
        },

        subtractFeeFromAmount: {
            handler: 'maybeShowFee',
            immediate: true
        },

        isValidated: {
            handler: 'maybeShowFee'
        },
        
        addressBookStt(val) {
            if (val.address != '' && val.purpose.toLowerCase() == 'send') {
                this.address = val.address;
            }
        }
    },

    beforeMount () {
        // Set up VeeValidator rules.

        this.$validator.extend('zcoinAddress', {
            getMessage: () => 'Invalid Zcoin Address',
            validate: (value) => isValidAddress(value, this.network)
        });

        this.$validator.extend('amountIsWithinAvailableBalance', {
            // this.availableXzc will still be reactively updated.
            getMessage: () => this.coinControlSelectedAmount == 0? ('Amount Is Over Your Available Balance of ' + convertToCoin(this.availableBalance)):'Amount Is Over Your Selected Amount of ' + convertToCoin(this.coinControlSelectedAmount),
            validate: (value) => (this.coinControlSelectedAmount == 0 && convertToSatoshi(value) <= this.availableBalance)
                                || (this.coinControlSelectedAmount > 0 && convertToSatoshi(value) <= this.coinControlSelectedAmount)
        });

        this.$validator.extend('publicAmountIsValid', {
            getMessage: () => 'Amount Must Be A Multiple of 0.00000001',
            // We use a regex here so as to not to have to deal with floating point issues.
            validate: (value) => Number(value) !== 0 && !!value.match(/^\d+(\.\d{1,8})?$/)
        });

        this.$validator.extend('privateAmountIsValid', {
            getMessage: () => 'Amount For Private Send Must Be A Multiple of 0.05',
            validate: (value) => {
                const v = convertToSatoshi(value);
                return (v % 5e6 === 0) && (v > 0);
            }
        });

        this.$validator.extend('privateAmountIsWithinBounds', {
            getMessage: () => 'Amount For Private Send May Not Exceed 500 XZC',
            validate: (value) => Number(value) <= 500
        });

        this.$validator.extend('privateAmountDoesntViolateInputLimits', {
            getMessage: () =>
                `Due to private transaction input limits, you can currently spend no more than ` +
                `${convertToCoin(this.maxPrivateSend)} XZC in one transaction. Try minting a larger denomination.`,

            validate: (value) => convertToSatoshi(value) <= this.maxPrivateSend
        });
    },

    methods: {
        convertToCoin,

        async maybeShowFee () {
            this.totalAmountExceedsBalance = false;

            try {
                // The empty string for an amount won't issue a validation error, but it would be invalid to pass to zcoind.
                if (
                    !await this.$validator.validate('txFeePerKb') ||
                    !await this.$validator.validate('amount') ||
                    typeof this.txFeePerKb !== 'number' ||
                    this.satoshiAmount === 0
                ) {
                    this.transactionFee = 0;
                    return;
                }
            } catch {
                // On startup, $validator.validate() will through an error because we're called before the page is loaded.
                this.transactionFee = 0;
                return;
            }

            const satoshiAmount = this.satoshiAmount;
            const subtractFeeFromAmount = this.subtractFeeFromAmount;
            const txFeePerKb = this.txFeePerKb;

            let p;
            if (this.privateOrPublic === 'private') {
                p = $daemon.calcPrivateTxFee(satoshiAmount, subtractFeeFromAmount);
            } else {
                p = $daemon.calcPublicTxFee(satoshiAmount, subtractFeeFromAmount, txFeePerKb);
            }

            try {
                const txFee = await p;
                if (this.satoshiAmount === satoshiAmount && this.subtractFeeFromAmount === subtractFeeFromAmount && this.txFeePerKb === txFeePerKb) {
                    this.transactionFee = txFee
                }
            } catch (e) {
                if (e instanceof ZcoindErrorResponse && e.errorCode === -6) {
                    this.totalAmountExceedsBalance = true;
                } else {
                    throw e;
                }
            }
        },

        cleanupForm () {
            this.label = '';
            this.amount = '';
            this.address = '';
            this.passphrase = '';
            this.closeSendPopover();
        },

        recalculatePopoverPosition () {
            // v-popover only knows to recalculate position on resize events, so fake that one happened in order to
            // trigger the update.
            window.dispatchEvent(new Event('resize'));
        },

        beginWaitToConfirmStep () {
            this.sendPopoverStep = 'waitToConfirm';
            this.recalculatePopoverPosition();
        },

        beginConfirmStep () {
            this.sendPopoverStep = 'confirm';
            this.recalculatePopoverPosition();
        },

        beginPassphraseStep () {
            this.sendPopoverStep = 'passphrase';
            this.recalculatePopoverPosition();
        },

        async attemptSend () {
            let coinControl;
            if (this.selectedUtxos && this.selectedUtxos.length > 0) {
                coinControl = this.selectedUtxos.map(element => [element.txid, element.txIndex]);
                this.$store.commit('ZcoinPayment/UPDATE_CUSTOM_INPUTS', []);
            }

            // This will have the effect of preventing the user from sending again without re-entering their passphrase.
            // JavaScript is single threaded, so there should be no race condition possible with an interruption between
            // the value check and the value assignment.
            let passphrase = this.passphrase;
            this.passphrase = '';
            if (!passphrase) {
                return;
            }

            this.sendPopoverStep = 'waitForReply';
            this.recalculatePopoverPosition();

            try {
                if (this.privateOrPublic === 'private') {
                    await $daemon.privateSend(passphrase, this.label, this.address, this.satoshiAmount,
                        this.subtractFeeFromAmount, coinControl);
                } else {
                    let d = await $daemon.publicSend(passphrase, this.label, this.address, this.satoshiAmount,
                        this.txFeePerKb, this.subtractFeeFromAmount, coinControl);
                }
            } catch (e) {
                if (e instanceof IncorrectPassphrase) {
                    this.beginIncorrectPassphraseStep();
                } else if (e instanceof ZcoindErrorResponse) {
                    this.beginErrorStep(e.errorMessage);
                } else {
                    throw e;
                }

                return;
            }
            
            this.beginCompleteStep();
        },

        beginIncorrectPassphraseStep () {
            this.sendPopoverStep = 'incorrectPassphrase';
            this.recalculatePopoverPosition();
        },

        beginErrorStep (errorMessage) {
            this.errorMessage = errorMessage;
            this.sendPopoverStep = 'error';
            this.recalculatePopoverPosition();
        },

        beginCompleteStep () {
            this.sendPopoverStep = 'complete';
            this.recalculatePopoverPosition();

            setTimeout(() => this.cleanupForm(), 1000);
        },

        closeSendPopover () {
            this.passphrase = '';
            this.sendPopoverStep = 'initial';
        },

        async selectCustomInputs() {
            this.$store.commit('ZcoinPayment/ENTERED_SEND_AMOUNT', this.amount? this.amount : 0);
            this.$store.dispatch('ZcoinPayment/TOGGLE_CUSTOM_INPUTS_POPUP');
        },

        async openAddressBook() {
            if (!this.addressBook || Object.keys(this.addressBook).length == 0) {
                const ab = await $daemon.readAddressBook();
                this.$store.dispatch('Transactions/setAddressBook', ab);
            }
            this.$store.dispatch('App/OPEN_ADDRESS_BOOK', {open: true, address: '', purpose: 'send'});
        }
    }
}
</script>

<style lang="scss" scoped>
.send-zcoin-form {
    height: 100vh;

    &.private-send {
        background-color: $color--comet-dark;
        color: darken($color--white-light, 10%);

        .totals {
            .value {
                color: white;
            }
        }

        input {
            color: $color--dark-light;
            background-color: $color--comet-light;

            &::placeholder {
                color: darken($color--dark-light, 10%);
            }
        }

        .amount-available {
            color: $color--comet-light;
        }
    }

    &.public-send {
        .totals {
            .value {
                color: $color--green-dark;
            }
        }

        .amount-available {
            color: $color--polo-dark;
        }
    }

    .description {
        @include description();
        margin-bottom: 1em;
    }
}

.send {
    padding: emRhythm(5) emRhythm(6) 0;
    height: 100vh;
    box-sizing: border-box;
}

.grid {
    display: grid;
    grid-template-rows: auto auto;
    height: 100%;
    @include bleed-h(3);
}

.form {
    & > header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}

fieldset {
    margin: 0;
    padding: 0;
    border: none;

    input[type="text"],
    select,
    .message {
        @include light-input();
    }

    .prefix {
        color: $color--polo-dark;
    }

    .fee-warning {
        font-style: italic;
        font-size: 0.85em;
    }

    .subtract-fee-from-amount-checkbox, .select-fee {
        font-weight: bold;
    }

    .amount-available {
        text-align: right;
        font-style: italic;
    }
}

.totals {
    margin-top: -3em;

    .field {
        font-weight: bold;

        label, .value {
            display: inline;
        }
    }

    .total {
        border-top: {
            color: black;
            width: 5px;
        }
    }
}

.total-amount-exceeds-balance {
    text-align: center;
    color: red;
    font: {
        style: italic;
        weight: bold;
    }
}

.button-wrap {
    padding-bottom: emRhythm(5);
}

.debug {
    align-self: end;
}

button, .send-button-popover-container {
    display: inline-block;
}

.buttons {
    text-align: center;
}

button {
    width: 10em;

    &.expanded {
        width: 20em;
    }
}

.ok-icon {
    font-size: 3em;
}

.popover {
    background-color: $color--comet-dark;
}
</style>
