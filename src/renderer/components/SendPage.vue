<template>
    <div id="send-page">
        <div id="send-primary">
            <input
                v-model="filter"
                type="text"
                placeholder="Search by label or address"
            />

            <AnimatedTable
                ref="table"
                :fields="tableFields"
                :data="filteredSendAddresses"
                :track-by="'address'"
                :on-row-select="navigateToAddressBookItem"
                :compare-elements="(a, b) => a.address === b.address && a.label === b.label"
                no-data-message="No Saved Addresses"
            />
        </div>

        <section class="send-detail">
            <div class="inner">
                <div id="top">
                    <div class="field" id="label-field">
                        <label>
                            Label
                        </label>

                        <input
                            id="label"
                            ref="label"
                            v-model.trim="label"
                            v-focus
                            type="text"
                            name="label"
                            tabindex="1"
                            placeholder="Label (optional)"
                        />
                    </div>

                    <div class="field" id="address-field">
                        <label>
                            Address
                        </label>

                        <input
                            id="address"
                            ref="address"
                            v-model="address"
                            v-validate.initial="'firoAddress'"
                            v-tooltip="getValidationTooltip('address')"
                            type="text"
                            name="address"
                            tabindex="2"
                            placeholder="Address"
                        />

                        <div id="add-to-address-book">
                            <a href="#" :class="{disabled: !showAddToAddressBook}" @click="addToAddressBook">
                                Add to Address Book
                            </a>
                        </div>
                    </div>

                    <div class="field" id="amount-field">
                        <label>
                            Amount
                        </label>

                        <div class="input-with-tip-container">
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
                                placeholder="Amount"
                            />

                            <span class="tip ticker">
                                FIRO
                            </span>
                        </div>
                    </div>

                    <div class="field">
                        <div class="custom-input-checkbox-container">
                            <input type="checkbox" v-model="useCustomInputs" />
                            <label>
                                <a href="#" @click="useCustomInputs = true; showCustomInputSelector = true">
                                    Custom Inputs (Coin Control)
                                </a>
                            </label>
                        </div>

                        <div v-if="useCustomInputs" class="selected-coin-value">
                            <label>Max Send:</label>
                            <div class="value">
                                <amount :amount="coinControlSelectedAmount" /> <span class="ticker">FIRO</span>
                            </div>
                        </div>

                        <Popup v-if="useCustomInputs" v-show="showCustomInputSelector" :close="() => showCustomInputSelector = false">
                            <InputSelection v-model="customInputs" :is-private="isPrivate" />
                        </Popup>
                    </div>

                    <div class="field">
                        <label>
                            <input type="checkbox" v-model="useCustomFee" />
                            Custom Transaction Fee
                        </label>

                        <div v-show="useCustomFee" class="input-with-tip-container">
                            <input
                                id="txFeePerKb"
                                ref="txFeePerKb"
                                v-model.number="txFeePerKb"
                                v-validate.initial="'txFeeIsValid'"
                                v-tooltip="getValidationTooltip('txFeePerKb')"
                                type="text"
                                name="txFeePerKb"
                                tabindex="4"
                            />

                            <span class="tip">
                                sat/kb
                            </span>
                        </div>
                    </div>

                    <div class="field" id="subtract-fee-from-amount">
                        <input v-model="subtractFeeFromAmount" type="checkbox" checked />
                        <label>
                            Take Transaction Fee From Amount
                        </label>
                    </div>
                </div>

                <div id="bottom">
                    <div id="totals">
                        <div class="total-field" id="receive-amount">
                            <label>
                                Recipient will receive:
                            </label>

                            <div v-if="transactionFee" class="value">
                                <amount :amount="amountToReceive" /> <span class="ticker">FIRO</span>
                            </div>
                            <div v-else class="value" />
                        </div>

                        <div class="total-field" id="transaction-fee">
                            <label>
                                Transaction fee:
                            </label>

                            <div v-if="transactionFee" class="value">
                                <amount :amount="transactionFee" /> <span class="ticker">FIRO</span>
                            </div>
                            <div v-else class="value" />
                        </div>

                        <div class="total-field" id="total-amount">
                            <label>
                                Total:
                            </label>

                            <div v-if="transactionFee" class="value">
                                <amount :amount="totalAmount" /> <span class="ticker">FIRO</span>
                            </div>

                            <div v-else class="value" />
                        </div>

                        <div v-if="error" class="error">
                            {{ error }}
                        </div>
                    </div>

                    <SendFlow
                        :disabled="!canBeginSend"
                        :is-private="isPrivate"
                        :label="label"
                        :address="address"
                        :amount="satoshiAmount"
                        :tx-fee-per-kb="txFeePerKb || 1"
                        :computed-tx-fee="transactionFee"
                        :subtract-fee-from-amount="subtractFeeFromAmount"
                        :coin-control="coinControl"
                        @success="cleanupForm"
                    />

                    <div class="footer">
                        <label id="private-balance-label">PRIVATE BALANCE:</label>
                        <div id="private-balance">{{ convertToCoin(availablePrivate) }} <span class="ticker">FIRO</span></div>
                        <label id="public-balance-label">PUBLIC BALANCE:</label>
                        <div id="public-balance">{{ convertToCoin(availablePublic) }} <span class="ticker">FIRO</span></div>
                        <div id="toggle" :class="isPrivate ? 'private' : 'public'">
                            <label id="toggle-label-private">PRIVATE</label>
                            <div class="toggle-switch" @click="togglePrivatePublic()">
                                <div class="inner" />
                            </div>
                            <label id="toggle-label-public">PUBLIC</label>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SendFlow from "renderer/components/SendPage/SendFlow";
import {isValidAddress} from 'lib/isValidAddress';
import {convertToSatoshi, convertToCoin} from 'lib/convert';
import Amount from "renderer/components/Sidebar/Amount";
import {FirodErrorResponse} from "daemon/firod";
import InputSelection from "renderer/components/SendPage/InputSelection";
import Popup from "renderer/components/Popup";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable";
import AddressBookItemEditableLabel from "renderer/components/AnimatedTable/AddressBookItemEditableLabel";
import AddressBookItemAddress from "renderer/components/AnimatedTable/AddressBookItemAddress";

export default {
    name: 'SendPage',

    components: {
        AnimatedTable,
        SendFlow,
        Amount,
        InputSelection,
        Popup
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
            useCustomFee: false,
            txFeePerKb: 1,
            isPrivate: true,
            showCustomInputSelector: false,
            useCustomInputs: false,
            customInputs: [],
            tableFields: [
                {name: AddressBookItemEditableLabel},
                {name: AddressBookItemAddress}
            ],

            // This is the search term to filter addresses by.
            filter: '',

            // This is the total, computed transaction fee.
            transactionFee: 0,

            // This is used if an error occurs computing the fee
            error: null,
        }
    },

    computed: {
        ...mapGetters({
            network: 'ApiStatus/network',
            availablePrivate: 'Balance/available',
            availablePublic: 'Balance/availablePublic',
            maxPrivateSend: 'Balance/maxPrivateSend',
            selectedUtxos: 'FiroPayment/selectedInputs',
            sendAddresses: 'AddressBook/sendAddresses',
            addressBook: 'AddressBook/addressBook'
        }),

        filteredSendAddresses () {
            // filter must be outside the closure for reactivity to work.
            const filter = this.filter;
            return this.sendAddresses.filter(address => address.label.includes(filter) || address.address.includes(filter));
        },

        showAddToAddressBook () {
            return isValidAddress(this.address, this.network) && !this.addressBook[this.address];
        },

        coinControl () {
            return this.customInputs.length ? this.customInputs.map(tx => [tx.txid, tx.txIndex]) : undefined;
        },

        coinControlSelectedAmount () {
            return this.customInputs.reduce((a, tx) => a + tx.amount, 0);
        },

        available () {
            return this.isPrivate ? this.availablePrivate : this.availablePublic;
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

        amountValidations () {
            return this.isPrivate ?
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

        useCustomFee() {
            if (!this.useCustomFee) {
                this.txFeePerKb = 1;
                // Make sure the validation warning goes away.
                this.$refs.txFeePerKb.value = 1;
            }
        },

        useCustomInputs() {
            if (this.useCustomInputs) {
                this.showCustomInputSelector = true;
            } else {
                this.customInputs.length = 0;
            }

            this.$validator.validateAll();
        },

        coinControlSelectedAmount() {
            this.$validator.validateAll();
        },

        txFeePerKb: {
            handler: 'maybeShowFee',
            immediate: true
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

        isPrivate: {
            handler: 'maybeShowFee'
        }
    },

    beforeMount () {
        // Set up VeeValidator rules.

        this.$validator.extend('firoAddress', {
            getMessage: () => 'The Firo address you entered is invalid',
            validate: (value) => isValidAddress(value, this.network)
        });

        this.$validator.extend('amountIsWithinAvailableBalance', {
            // this.availableXzc will still be reactively updated.
            getMessage: () => this.useCustomInputs ?
                `Amount is over the sum of your selected coins, ${convertToCoin(this.coinControlSelectedAmount)} FIRO`
                :
                `Amount is over your available balance of ${convertToCoin(this.available)} FIRO`,

            validate: (value) => this.useCustomInputs ?
                convertToSatoshi(value) <= this.coinControlSelectedAmount
                :
                convertToSatoshi(value) <= this.available
        });

        this.$validator.extend('publicAmountIsValid', {
            getMessage: () => 'Amount must be a multiple of 0.00000001',
            // We use a regex here so as to not to have to deal with floating point issues.
            validate: (value) => Number(value) !== 0 && !!value.match(/^\d+(\.\d{1,8})?$/)
        });

        this.$validator.extend('privateAmountIsValid', {
            getMessage: () => 'Amount for private send must be a multiple of 0.05',
            validate: (value) => {
                const v = convertToSatoshi(value);
                return (v % 5e6 === 0) && (v > 0);
            }
        });

        this.$validator.extend('privateAmountIsWithinBounds', {
            getMessage: () => 'Amount for private send may not exceed 500 FIRO',
            validate: (value) => Number(value) <= 500
        });

        this.$validator.extend('privateAmountDoesntViolateInputLimits', {
            getMessage: () =>
                `Due to private transaction input limits, you can currently spend no more than ` +
                `${convertToCoin(this.maxPrivateSend)} FIRO in one transaction. Try minting a larger denomination.`,

            validate: (value) => convertToSatoshi(value) <= this.maxPrivateSend
        });

        this.$validator.extend('txFeeIsValid', {
            getMessage: () => 'Transaction fee must be an integer between 1 and 10,000',
            validate: (value) => value > 0 && value <= 10_000 && (value % 1 === 0)
        })
    },

    methods: {
        convertToCoin,

        async addToAddressBook() {
            if (!this.showAddToAddressBook) return;
            if (this.addressBook[this.address]) return;

            const item = {
                address: this.address,
                label: this.label,
                purpose: 'send'
            };
            $store.commit('AddressBook/updateAddress', item);
            await $daemon.addAddressBookItem(item);
        },

        navigateToAddressBookItem(addressBookItem) {
            this.address = addressBookItem.address;
            this.label = addressBookItem.label;
        },

        togglePrivatePublic() {
            const p = this.isPrivate;
            this.cleanupForm();
            this.isPrivate = !p;
        },

        async maybeShowFee () {
            this.transactionFee = 0;
            this.error = null;
            this.totalAmountExceedsBalance = false;

            try {
                // The empty string for an amount won't issue a validation error, but it would be invalid to pass to firod.
                if (
                    (this.useCustomFee && !await this.$validator.validate('txFeePerKb')) ||
                    !(Number(this.txFeePerKb) > 0) ||
                    !await this.$validator.validate('amount') ||
                    this.satoshiAmount === 0
                ) {
                    return;
                }
            } catch {
                // On startup, $validator.validate() will throw an error because we're called before the page is loaded.
                return;
            }

            const satoshiAmount = this.satoshiAmount;
            const subtractFeeFromAmount = this.subtractFeeFromAmount;
            const txFeePerKb = this.useCustomFee ? this.txFeePerKb : 1;

            let p;
            if (this.isPrivate) {
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
                if (e instanceof FirodErrorResponse && e.errorCode === -6) {
                    this.error = e;
                } else {
                    this.error = `${e}`;
                }
            }
        },

        cleanupForm () {
            this.label = '';
            this.amount = '';
            this.address = '';
            this.isPrivate = true;
        }
    }
}
</script>

<style lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/inputs";
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/typography";

#send-page {
    height: 100%;

    #send-primary {
        height: 100%;
        width: $size-primary-content-width;
        float: left;
        display: flex;
        flex-direction: column;

        padding: $size-main-margin;

        input[type="text"] {
            @include search-input();
            margin-bottom: $size-medium-space;
        }

        .animated-table {
            flex-grow: 1;
        }
    }

    .send-detail {
        width: $size-secondary-content-width;
        float: right;
        box-sizing: border-box;
        padding: $size-detail-margin;
        height: 100%;
        background-color: $color-detail-background;

        label {
            @include label();
        }

        .input-with-tip-container {
            width: fit-content;
            position: relative;

            .tip {
                position: absolute;
                bottom: $size-input-vertical-padding;
                right: $size-input-horizontal-padding;
            }
        }

        .ticker {
            @include ticker();
        }

        .inner {
            height: 100%;
            display: flex;
            flex-flow: column;

            #top {
                flex-grow: 1;

                .field {
                    width: fit-content;

                    &:not(:first-child) {
                        margin-top: $size-between-field-space-big;
                    }

                    label, input[type="text"] {
                        display: block;
                    }

                    input[type="text"] {
                        @include wide-input-field();
                    }

                    &#address-field {
                        input {
                            @include address();
                        }

                        #add-to-address-book {
                            text-align: right;

                            a {
                                @include small();
                                @include optional-action;

                                &.disabled {
                                    cursor: default;
                                    opacity: 0.3;
                                }
                            }
                        }
                    }

                    &#select-custom-inputs {
                        a {
                            @include optional-action();
                        }
                    }

                    &#subtract-fee-from-amount {
                        * {
                            display: inline;
                        }
                    }

                    .custom-input-checkbox-container {
                        * {
                            display: inline-block;
                        }
                    }

                    .selected-coin-value {
                        * {
                            display: inline;
                        }
                    }
                }
            }

            #bottom {
                #totals {
                    .total-field {
                        margin-bottom: $size-small-space;

                        label, .value {
                            display: inline;
                        }

                        label {
                            margin-right: $size-medium-space;
                        }

                        .value {
                            float: right;
                        }
                    }
                }

                .error {
                    @include error();
                    margin-bottom: $size-small-space;
                }

                .footer {
                    @include small();
                    margin-top: $size-small-space;

                    display: grid;
                    grid-gap: $size-tiny-space;

                    #private-balance-label {
                        grid-row: 1;
                        grid-column: 1;
                    }

                    #private-balance {
                        text-align: right;
                        grid-row: 1;
                        grid-column: 2;
                    }

                    #public-balance-label {
                        grid-row: 2;
                        grid-column: 1;
                    }

                    #public-balance {
                        text-align: right;
                        grid-row: 2;
                        grid-column: 2;
                    }

                    #toggle {
                        @include label();
                        user-select: none;
                        grid-row: 2;
                        grid-column: 4;
                        justify-self: end;

                        .toggle-switch {
                            height: 0.7em;
                            width: $size-medium-space;
                            padding: 1px;
                            display: inline-block;
                            background-color: black;
                            border-radius: 5px;

                            .inner {
                                height: 0.7em;
                                display: inline-block;
                                position: relative;
                                width: $size-medium-space / 2;
                                background-color: red;
                                border-radius: 5px;

                                @at-root #toggle.private {
                                    #toggle-label-public {
                                        opacity: 0.4;
                                    }

                                    .inner {
                                        float: left;
                                    }
                                }

                                @at-root #toggle.public {
                                    #toggle-label-private {
                                        opacity: 0.4;
                                    }

                                    .inner {
                                        float: right;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>