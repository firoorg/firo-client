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
                            spellcheck="false"
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

                        <Popup v-if="showCustomInputSelector" :close="() => showCustomInputSelector = false">
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
                                :placeholder="smartFeePerKb"
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

                        <div v-if="transactionFeeError" class="error">
                            {{ transactionFeeError }}
                        </div>
                    </div>

                    <SendFlow
                        :disabled="!canBeginSend"
                        :is-private="isPrivate"
                        :label="label"
                        :address="address"
                        :amount="satoshiAmount"
                        :tx-fee-per-kb="Number(txFeePerKb)"
                        :computed-tx-fee="transactionFee || 0"
                        :subtract-fee-from-amount="subtractFeeFromAmount"
                        :coin-control="coinControl"
                        @success="cleanupForm"
                    />

                    <div class="footer">
                        <PrivatePublicBalance v-model="isPrivate" />
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import lodash from 'lodash';
import { mapGetters } from 'vuex';
import SendFlow from "renderer/components/SendPage/SendFlow";
import {isValidAddress} from 'lib/isValidAddress';
import {convertToSatoshi, convertToCoin} from 'lib/convert';
import Amount from "renderer/components/shared/Amount";
import {FirodErrorResponse} from "daemon/firod";
import InputSelection from "renderer/components/SendPage/InputSelection";
import Popup from "renderer/components/shared/Popup";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable";
import AddressBookItemEditableLabel from "renderer/components/AnimatedTable/AddressBookItemEditableLabel";
import AddressBookItemAddress from "renderer/components/AnimatedTable/AddressBookItemAddress";
import PrivatePublicBalance from "renderer/components/shared/PrivatePublicBalance";

export default {
    name: 'SendPage',

    components: {
        PrivatePublicBalance,
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
            subtractFeeFromAmount: false,
            useCustomFee: false,
            // In certain cases, firod might suggest very low fees. Practically, we probably never want this.
            txFeePerKb: '',
            isPrivate: true,
            showCustomInputSelector: false,
            useCustomInputs: false,
            customInputs: [],
            tableFields: [
                {name: AddressBookItemEditableLabel, width: "160pt"},
                {name: AddressBookItemAddress}
            ],

            // This is the search term to filter addresses by.
            filter: ''
        }
    },

    asyncComputed: {
        // Returns [number (txfee in satoshi), error (string)], one of which will be null.
        async transactionFeeAndError() {
            // The whole point of this dance is to prevent repeated calls to the daemon, which are unfortunately slow.
            const satoshiAmount = this.satoshiAmount;
            const txFeePerKb = this.useCustomFee ? this.txFeePerKb : this.smartFeePerKb;
            const coinControl = this.coinControl;
            const subtractFeeFromAmount = this.subtractFeeFromAmount;
            const isPrivate = this.isPrivate;

            if (!this.satoshiAmount) return;
            if (this.useCustomFee && !this.txFeePerKb) return;

            await new Promise(r => setTimeout(r, 500));
            if (!lodash.isEqual(
                [satoshiAmount, txFeePerKb, coinControl, subtractFeeFromAmount, isPrivate],
                [this.satoshiAmount, this.useCustomFee ? this.txFeePerKb : this.smartFeePerKb, this.coinControl, this.subtractFeeFromAmount, this.isPrivate]
            )) return;

            if (this.getValidationTooltip('amount').content) return;

            try {
                if (this.isPrivate) {
                    return [await $daemon.calcLelantusTxFee(satoshiAmount, txFeePerKb, subtractFeeFromAmount, this.coinControl), null];
                } else {
                    return [await $daemon.calcPublicTxFee(satoshiAmount, subtractFeeFromAmount, txFeePerKb), null];
                }
            } catch (e) {
                if (e instanceof FirodErrorResponse) {
                    return [null, e.errorMessage];
                } else {
                    return [null, `${e}`];
                }
            }
        }
    },

    computed: {
        ...mapGetters({
            network: 'ApiStatus/network',
            isLelantusAllowed: 'ApiStatus/isLelantusAllowed',
            availablePrivate: 'Balance/available',
            availablePublic: 'Balance/availablePublic',
            sendAddresses: 'AddressBook/sendAddresses',
            addressBook: 'AddressBook/addressBook',
            _smartFeePerKb: 'ApiStatus/smartFeePerKb'
        }),

        transactionFee() {
            return this.transactionFeeAndError && this.transactionFeeAndError[0];
        },

        transactionFeeError() {
            return this.transactionFeeAndError && this.transactionFeeAndError[1];
        },

        smartFeePerKb() {
            return Math.max(this._smartFeePerKb, 10);
        },

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
            return !!(this.amount && this.address && this.transactionFee && !this.validationErrors.items.length);
        },

        amountValidations () {
            if (this.isPrivate) {
                return 'amountIsWithinAvailableBalance|amountIsValid|privateAmountDoesntViolateSpendLimit';
            } else {
                return 'amountIsWithinAvailableBalance|amountIsValid';
            }
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
                this.txFeePerKb = '';
                // Make sure the validation warning goes away.
                this.$refs.txFeePerKb.value = '';
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

        isPrivate() {
            this.cleanupForm(false);
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

        this.$validator.extend('amountIsValid', {
            getMessage: () => 'Amount must be a multiple of 0.00000001',
            // We use a regex here so as to not to have to deal with floating point issues.
            validate: (value) => Number(value) !== 0 && !!value.match(/^\d+(\.\d{1,8})?$/)
        });

        this.$validator.extend('privateAmountDoesntViolateSpendLimit', {
            getMessage: () =>
                `Due to private transaction spend limits, you may not spend more than 1001 FIRO (including fees) in one transaction`,

            validate: (value) => this.subtractFeeFromAmount ? convertToSatoshi(value) <= 1001e8 : convertToSatoshi(value) <= 1000.99e8
        });

        this.$validator.extend('txFeeIsValid', {
            getMessage: () => 'Transaction fee must be an integer between 1 and 1,000,000',
            validate: (value) => value > 0 && value <= 1_000_000 && (value % 1 === 0)
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

        cleanupForm(enablePrivate=true) {
            if (enablePrivate) this.isPrivate = true;
            this.useCustomInputs = false;
            this.label = '';
            this.amount = '';
            this.address = '';
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
            }
        }
    }
}
</style>
