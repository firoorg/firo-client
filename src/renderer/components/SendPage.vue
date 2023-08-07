<template>
    <div class="send-page">
        <div class="send-primary">
            <SearchInput v-model="filter" placeholder="Search by label or address" />

            <AnimatedTable
                ref="animatedTable"
                :fields="tableFields"
                :data="filteredSendAddresses"
                :track-by="'address'"
                :on-row-select="navigateToAddressBookItem"
                :compare-elements="(a, b) => a.address === b.address"
                no-data-message="No Saved Addresses"
            />
        </div>

        <div class="send-detail detail" :class="{disabled: formDisabled}">
            <Form ref="form" as="div" class="inner" :validation-schema="validationSchema" v-slot="{errors, meta}">
                <div class="top">
                    <Dropdown
                        v-if="enableElysium"
                        labelText="Asset"
                        :options="availableAssets"
                        v-model="selectedAsset"
                    />

                    <InputFrame label="Label">
                        <Field
                            id="label"
                            ref="label"
                            v-model.trim.lazy="label"
                            v-focus
                            type="text"
                            name="label"
                            tabindex="1"
                            placeholder="Label"
                            :disabled="formDisabled"
                        />
                    </InputFrame>

                    <InputFrame label="Address">
                        <Field
                            id="address"
                            ref="address"
                            v-model="address"
                            v-tooltip="errors.address"
                            type="text"
                            name="address"
                            tabindex="2"
                            placeholder="Address"
                            spellcheck="false"
                            :disabled="formDisabled"
                        />
                    </InputFrame>

                    <div v-if="!isPrivate" class="warning-text">
                        <div class="warning-item">
                            <FiroWarning class="warning-icon" />
                            <label>
                                You are using a transparent transaction, please go private.
                            </label>
                        </div>
                        <div class="warning-item warning-item-text">
                            <FiroWarning class="warning-icon" />
                            <label>
                                If this is a masternode transaction, you do not have to go private
                            </label>
                        </div>
                    </div>   

                    <div class="checkbox-field add-to-address-book" :class="{disabled: !showAddToAddressBook}">
                        <PlusButton :disabled="!showAddToAddressBook" />
                        <label @click="addToAddressBook">Add to address book</label>
                    </div>

                    <InputFrame class="input-frame-amount" label="Amount">
                        <Field
                            id="amount"
                            ref="amount"
                            v-model="amount"
                            v-tooltip="errors.amount"
                            type="text"
                            name="amount"
                            class="amount"
                            tabindex="3"
                            placeholder="Amount"
                        />
                    </InputFrame>

                    <div v-show="selectedAsset == 'FIRO'" class="checkbox-field">
                        <input type="checkbox" v-model="useCustomInputs" :disabled="formDisabled"/>
                        <label><a id="custom-inputs-button" @click="useCustomInputs = showCustomInputSelector = true">Custom Inputs (Coin Control)</a></label>

                        <Popup v-if="showCustomInputSelector">
                            <InputSelection v-model="customInputs" :is-private="isPrivate" @cancel="showCustomInputSelector = false" @ok="showCustomInputSelector = false" />
                        </Popup>
                    </div>

                    <div v-if="selectedAsset == 'FIRO' && useCustomInputs" class="max-send">
                        <label>Max Send: </label>
                        <amount :amount="coinControlSelectedAmount" ticker="FIRO" />
                    </div>

                    <div v-show="selectedAsset == 'FIRO'" class="checkbox-field">
                        <input id="subtract-fee-from-amount" type="checkbox" v-model="subtractFeeFromAmount" />
                        <label>Take Transaction Fee From Amount</label>
                    </div>

                    <div v-show="selectedAsset == 'FIRO'" class="checkbox-field">
                        <input id="use-custom-fee" type="checkbox" v-model="useCustomFee" />
                        <label>Custom Transaction Fee</label>
                    </div>

                    <InputFrame v-show="selectedAsset == 'FIRO' && useCustomFee" class="input-frame-tx-fee" unit="sat/kb">
                        <Field
                            id="txFeePerKb"
                            ref="txFeePerKb"
                            v-model="userTxFeePerKb"
                            v-tooltip="errors.txFeePerKb"
                            :placeholder="smartFeePerKb"
                            type="text"
                            name="txFeePerKb"
                            tabindex="4"
                        />
                    </InputFrame>

                    <div v-show="selectedAsset == 'FIRO'" class="totals">
                        <div class="total-field">
                            <label>
                                Recipient will receive:
                            </label>

                            <div v-if="transactionFee" class="value">
                                <amount :amount="amountToReceive" ticker="FIRO" />
                            </div>
                            <div v-else class="value" />
                        </div>

                        <div class="total-field">
                            <label>
                                Transaction fee:
                            </label>

                            <div v-if="transactionFee" id="computed-transaction-fee" class="value">
                                <amount :amount="transactionFee" ticker="FIRO" />
                            </div>
                            <div v-else class="value" />
                        </div>

                        <div class="total-field">
                            <label>
                                Total:
                            </label>

                            <div v-if="transactionFee" class="value">
                                <amount :amount="totalAmount" ticker="FIRO" />
                            </div>

                            <div v-else class="value" />
                        </div>
                    </div>
                </div>

                <div class="bottom">
                    <SendFlow
                        :disabled="!canBeginSend || meta.valid != true"
                        :asset="selectedAsset"
                        :is-private="isPrivate"
                        :label="label"
                        :address="address"
                        :amount="satoshiAmount"
                        :tx-fee-per-kb="txFeePerKb"
                        :computed-tx-fee="transactionFee"
                        :subtract-fee-from-amount="subtractFeeFromAmount"
                        :coin-control="coinControl"
                        @success="() => cleanupForm()"
                        @reset="() => cleanupForm()"
                    />

                    <div class="footer">
                        <PrivatePublicBalance :asset="selectedAsset" :disabled="!isBlockchainSynced" v-model="isPrivate" />
                    </div>
                </div>
            </Form>
        </div>
    </div>
</template>

<script>
import {markRaw} from "vue";
import { mapGetters } from 'vuex';
import {Form, Field} from "vee-validate";
import SendFlow from "renderer/components/SendPage/SendFlow";
import {isValidAddress, isValidPaymentCode} from 'lib/isValidAddress';
import {bigintToString, stringToBigint} from 'lib/convert';
import Dropdown from "renderer/components/shared/Dropdown";
import Amount from "renderer/components/shared/Amount";
import InputSelection from "renderer/components/SendPage/InputSelection";
import Popup from "renderer/components/shared/Popup";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable";
import CurrentAddressIndicator from "renderer/components/AnimatedTable/CurrentAddressIndicator";
import AddressBookItemLabel from "renderer/components/AnimatedTable/AddressBookItemLabel";
import AddressBookItemAddress from "renderer/components/AnimatedTable/AddressBookItemAddress";
import PrivatePublicBalance from "renderer/components/shared/PrivatePublicBalance";
import TransactionInfo from "renderer/components/TransactionsPage/TransactionInfo";
import SearchInput from "renderer/components/shared/SearchInput";
import InputFrame from "renderer/components/shared/InputFrame";
import PlusButton from "renderer/components/shared/PlusButton";
import FiroSymbol from "renderer/assets/CoinIcons/FIRO.svg.data";
import FiroWarning from 'renderer/assets/FiroWarning';

export default {
    name: 'SendPage',

    components: {
        Form,
        Field,
        Dropdown,
        PlusButton,
        PrivatePublicBalance,
        AnimatedTable,
        SendFlow,
        Amount,
        InputSelection,
        Popup,
        InputFrame,
        SearchInput,
        TransactionInfo,
        FiroWarning
    },

    data () {
        return {
            label: this.$route.query.label || '',
            amount: this.$route.query.amount || '',
            address: this.$route.query.address || '',
            subtractFeeFromAmount: false,
            useCustomFee: false,
            userTxFeePerKb: String($store.getters['ApiStatus/smartFeePerKb']),
            isPrivate: true,
            showCustomInputSelector: false,
            useCustomInputs: false,
            customInputs: [],
            tableFields: [
                {name: markRaw(CurrentAddressIndicator)},
                {name: markRaw(AddressBookItemLabel)},
                {name: markRaw(AddressBookItemAddress)},
            ],
            // This is the search term to filter addresses by.
            filter: '',
            selectedAsset: 'FIRO',
            showConnectionTransaction: false,
            connectionTransaction: null,
            availableSparkFiro: 0,
            isSparkAddr: null
        }
    },

    computed: {
        ...mapGetters({
            enableElysium: 'App/enableElysium',
            network: 'ApiStatus/network',
            isLelantusAllowed: 'ApiStatus/isLelantusAllowed',
            isSparkAllowed: 'ApiStatus/isSparkAllowed',
            isBlockchainSynced: 'ApiStatus/isBlockchainSynced',
            availablePrivate: 'Balance/availablePrivate',
            availableLelantus: 'Balance/availableLelantus',
            availablePublic: 'Balance/availablePublic',
            sendAddresses: 'AddressBook/sendAddresses',
            addressBook: 'AddressBook/addressBook',
            smartFeePerKb: 'ApiStatus/smartFeePerKb',
            calculateTransactionFee: 'Transactions/calculateTransactionFee',
            selectedTokens: 'Elysium/selectedTokens',
            tokenData: 'Elysium/tokenData',
            aggregatedElysiumBalances: 'Elysium/aggregatedBalances'
        }),

        validationSchema() {
            [this.amountIsWithinAvailableBalance, this.amountIsValid, this.isPrivate, this.privateAmountDoesntViolateSpendLimit];

            return {
                address: this.firoAddress,
                amount: (value) => {
                    if (!value) return true;

                    for (const err of [
                        this.amountIsWithinAvailableBalance(value),
                        this.amountIsValid(value),
                        this.isPrivate && this.privateAmountDoesntViolateSpendLimit(value)
                    ]) {
                        if (err) return err;
                    }

                    return true;
                },
                txFeePerKb: this.txFeeIsValid
            }
        },

        amountIsValid() {
            [this.selectedAsset, this.tokenData];

            return (value) => {
                if (
                    Number(value) !== 0 &&
                    ((this.selectedAsset == 'FIRO' || this.tokenData[this.selectedAsset].isDivisible) ?
                            !!value.match(/^\d+(\.\d{1,8})?$/)
                            :
                            !!value.match(/^\d+$/)
                    )
                ) return true;

                return `Amount must be a multiple of ${(this.selectedAsset == 'FIRO' || this.tokenData[this.selectedAsset].isDivisible) ? '0.00000001' : '1'}`;
            };
        },

        privateAmountDoesntViolateSpendLimit() {
            [this.selectedAsset, this.totalAmount];

            return () => {
                if (this.selectedAsset != 'FIRO' || this.totalAmount <= 5001e8)
                    return true;

                return 'Due to private transaction spend limits, you may not spend more than 5001 FIRO (including fees) in one transaction';
            };
        },

        txFeeIsValid() {
            return (value_) => {
                let value;
                try {
                    value = BigInt(value_);
                } catch {
                    value = NaN;
                }

                if (value > 0n && value <= 1000000n)
                    return true;

                return 'Transaction fee must be an integer between 1 and 1,000,000';
            };
        },

        firoAddress() {
            this.network;

            return (value) => {
                if (!value) return '';

                if (isValidAddress(value, this.network) || isValidPaymentCode(value, this.network))
                    return true;

                return 'The Firo address you entered is invalid';
            };
        },

        amountIsWithinAvailableBalance() {
            [
                this.selectedAsset, this.transactionFee, this.aggregatedElysiumBalances, this.satoshiAmount,
                this.coinControlSelectedAmount, this.useCustomInputs, this.available, this.ticker
            ];

            return () => {
                if (
                    this.selectedAsset == 'FIRO' ?
                        !!this.transactionFee
                        :
                        this.aggregatedElysiumBalances[this.selectedAsset].priv >= this.satoshiAmount
                ) return true;

                if (this.useCustomInputs)
                    return `Amount (including fees) is over the sum of your selected coins, ${bigintToString(this.coinControlSelectedAmount)} FIRO`;
                else if (this.selectedAsset == 'FIRO')
                    return `Amount (including fees) is over your available balance of ${bigintToString(this.available)} FIRO`;
                else if (this.tokenData[this.selectedAsset].isDivisible)
                    return `Amount (including fees) is over your available balance of ${bigintToString(this.available)} ${this.ticker}`;
                else
                    return `Amount (including fees) is over your available balance of ${this.available} ${this.ticker}`;
            };
        },

        availableAssets() {
            let assets = [];
            for (const tk of this.selectedTokens) {
                const token = this.tokenData[tk];
                if (!token) continue;
                assets.push({id: token.creationTx, name: token.name});
            }
            assets = assets.sort((a, b) => a.name.localeCompare(b.name));
            assets.unshift({id: 'FIRO', name: 'Firo', icon: FiroSymbol});
            return assets;
        },

        transactionFee() {
            if (this.selectedAsset != 'FIRO' || !this.satoshiAmount || !this.available || this.available < this.satoshiAmount) return undefined;
            return this.calculateTransactionFee(this.isPrivate, this.isSparkAllowed, isValidAddress(this.address, this.network), this.satoshiAmount, this.txFeePerKb, this.subtractFeeFromAmount, this.customInputs.length ? this.customInputs : undefined) || 0n;
        },

        formDisabled() {
            return !this.isBlockchainSynced || (this.isPrivate && !this.isLelantusAllowed);
        },

        txFeePerKb() {
            try {
                return BigInt(this.userTxFeePerKb);
            } catch (e) {
                return this.smartFeePerKb;
            }
        },

        filteredSendAddresses () {
            this.$nextTick(() => this.$refs.animatedTable && this.$refs.animatedTable.reload());
            return this.sendAddresses
                .filter(address => address.label.includes(this.filter) || address.address.includes(this.filter))
                .map(address => ({ isSelected: address.address === this.address, ...address }));
        },

        showAddToAddressBook () {
            return !this.formDisabled && (isValidAddress(this.address, this.network) || this.isSparkAddr) && !this.addressBook[this.address];
        },

        coinControl () {
            return this.customInputs.length ? this.customInputs.map(txo => [txo.txid, txo.index]) : undefined;
        },

        coinControlSelectedAmount () {
            return this.customInputs.reduce((a, txo) => a + txo.amount, 0n);
        },

        available () {
            if (this.selectedAsset != 'FIRO') return this.aggregatedElysiumBalances[this.selectedAsset].priv;
            else if (this.coinControl) return this.coinControlSelectedAmount;
            else if (this.isPrivate) return this.availablePrivate;
            else return this.availablePublic;
        },

        ticker () {
            if (this.selectedAsset == 'FIRO') return 'FIRO';
            else return this.tokenData[this.selectedAsset].ticker;
        },

        // This is the amount the user entered in satoshis.
        satoshiAmount () {
            return (this.selectedAsset == 'FIRO' || this.tokenData[this.selectedAsset].isDivisible) ? stringToBigint(this.amount) : BigInt(this.amount);
        },

        // This is the amount the user will receive. It may be less than satoshiAmount.
        amountToReceive () {
            return this.subtractFeeFromAmount ? this.satoshiAmount - this.transactionFee : this.satoshiAmount;
        },

        // This is the total amount that will be sent, including transaction fee.
        totalAmount () {
            if (!this.transactionFee) return this.satoshiAmount;
            return this.subtractFeeFromAmount ? this.satoshiAmount : this.satoshiAmount + this.transactionFee;
        },

        // We can begin the send if the fee has been shown and the form is valid.
        canBeginSend () {
            return this.selectedAsset != 'FIRO' || (this.transactionFee > 0n && this.available >= this.totalAmount && this.amount);
        }
    },

    watch: {
        $route(to) {
            this.address = to.query.address || '';
            this.label = to.query.label || '';
            this.amount = to.query.amount || '';
        },

        useCustomFee() {
            if (!this.useCustomFee)
                this.userTxFeePerKb = this.smartFeePerKb;
        },

        subtractFeeFromAmount() {
            this.$refs.form.validate();
        },

        useCustomInputs() {
            this.$refs.form.validate();
        },

        coinControlSelectedAmount() {
            this.$refs.form.validate();
        },

        userTxFeePerKb() {
            this.$refs.form.validate();
        },

        isPrivate() {
            this.cleanupForm(false);
        },

        label() {
            const a = this.addressBook[this.address];
            if (a && a.purpose === 'send' && a.label !== this.label) {
                this.addToAddressBook();
            }
        },

        address() {
            this.validateSparkAddress();
            const a = this.addressBook[this.address];
            if (a && a.purpose === 'send' && a.label !== this.label) {
                this.addToAddressBook();
            }
        },

        selectedAsset() {
            if (this.selectedAsset != 'FIRO') {
                this.isPrivate = true;
                this.useCustomInputs = false;
                this.useCustomFee = false;
                this.subtractFeeFromAmount = false;
            }

            this.$refs.form.validate();
        }
    },

    beforeMount () {
        window.setSelectedAsset = (id) => this.setSelectedAsset(id);
    },

    methods: {
        setSelectedAsset(id) {
            this.selectedAsset = id;
        },

        async addToAddressBook() {
            this.validateSparkAddress();
            if ((!isValidAddress(this.address, this.network) && !this.isSparkAddr) || !this.label) return;

            if (this.addressBook[this.address]) {
                const item = this.addressBook[this.address];
                await $daemon.updateAddressBookItem(item, this.label);
                $store.commit('AddressBook/updateAddress', {...item, label: this.label});
                this.$refs.animatedTable.reload();
            } else {
                if(isValidAddress(this.address, this.network)){
                    const item = {
                    addressType: "Transparent",
                    address: this.address,
                    label: this.label,
                    purpose: 'send'
                    };
                    $store.commit('AddressBook/updateAddress', { ...item, createdAt: Date.now() });
                    await $daemon.addAddressBookItem(item);
                } else {
                    const item = {
                    addressType: "Spark",
                    address: this.address,
                    label: this.label,
                    purpose: 'send'
                    };
                    $store.commit('AddressBook/updateAddress', { ...item, createdAt: Date.now() });
                    await $daemon.addAddressBookItem(item);
                }
            }
        },

        navigateToAddressBookItem(addressBookItem) {
            this.address = addressBookItem.address;
            this.label = addressBookItem.label;
        },

        cleanupForm(enablePrivate=true) {
            if (enablePrivate) this.isPrivate = true;
            this.useCustomInputs = false;
            this.useCustomFee = false;
            this.subtractFeeFromAmount = false;
            this.label = '';
            this.amount = '';
            this.address = '';
        },

        isTransparentAddress() {
            return isValidAddress(this.address, this.network);
        },

        async validateSparkAddress() {
            let res = await $daemon.validateSparkAddress(this.address);
            this.isSparkAddr = res.valid;
            return this.isSparkAddr;
        },
    }
}
</script>

<style lang="scss">
.send-page {
    height: 100%;
    display: flex;

    .send-primary {
        height: 100%;
        flex-grow: 1;
        display: flex;
        flex-direction: column;

        padding: var(--padding-base);

        .animated-table {
            margin-top: var(--padding-base);
            flex-grow: 1;
        }
    }

    .send-detail {
        height: 100%;
        width: var(--width-detail);
        padding: var(--padding-base);
        background-color: var(--color-background-detail);

        &.disabled {
            opacity: 0.3;
        }

        .inner {
            height: 100%;
            display: flex;
            flex-flow: column;

            .top {
                flex-grow: 1;

                .framed-input {
                    width: 100%;
                }

                .add-to-address-book {
                    margin-bottom: 10px;

                    &:not(.disabled) {
                        &, label {
                            cursor: pointer;
                        }
                    }

                    &.disabled {
                        &, label {
                            color: var(--color-text-disabled);
                        }
                    }

                    label {
                        color: var(--color-secondary);
                        font-weight: bold;
                    }
                }

                .input-frame-amount {
                    margin-bottom: 20px;
                }

                .checkbox-field:not(.add-to-address-book) {
                    margin-bottom: 6px;
                }

                #custom-inputs-button {
                    text-decoration: underline;
                    cursor: pointer;
                }

                .max-send {
                    margin-bottom: 10px;
                    opacity: 0.5;
                    font-weight: bold;

                    label {
                        white-space: pre;
                    }

                    label, .amount {
                        display: inline-block;
                    }

                    .amount {
                        color: var(--color-secondary);
                    }
                }

                .totals {
                    margin-top: 30px;
                    padding-top: 30px;
                    border-top: {
                        width: 1px;
                        color: var(--color-text-subtle-border);
                        style: solid;
                    }

                    .total-field {
                        display: flex;
                        justify-content: space-between;
                    }
                }

                .warning-text {
                    margin-bottom: 6px;
                    color: #FFA800;
                    font-size: 10px;

                    .warning-item {
                        display: flex;
                        align-items: center;
                    }

                    .warning-icon {
                        height: 12px;
                        width: 12px;
                        margin-right: 5px;
                    }

                    .warning-item-text {
                        margin-top: 8px;
                    }
                }
            }

            .bottom {
                .error {
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: var(--padding-base);
                }
            }
        }
    }
}
</style>
