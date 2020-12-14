<template>
    <section class="coin-swap-detail">
        <div class="inner">
            <div id="top">
                <header class="header-wrapper">
                    <div class="title-wrapper">
                        <h2 class="total-field">Coin Swap</h2>
                        <div class="logo-wrapper">Powered by <SwitchainIcon /></div>
                    </div>
                    <p class="total-field">Page description and explanation what to do</p>
                </header>

                <div class="radio-buttons-wrapper">
                    <label class="radio-button-wrapper">Swap from FIRO
                        <input type="radio" v-model="swapType" value="from" :checked="swapType === 'from'" name="radio">
                        <span class="checkmark"></span>
                    </label>
                    <label class="radio-button-wrapper">Swap to FIRO
                        <input type="radio" v-model="swapType" value="to" :checked="swapType === 'to'" name="radio">
                        <span class="checkmark"></span>
                    </label>
                </div>

                <div class="field" id="label-field">
                    <label>
                        {{ swapType === 'from' ? 'Receive' : 'Send' }}
                    </label>

                    <vue-select
                        class="select"
                        label="coin"
                        :loading="spinner.currencies"
                        :options="swapType === 'from' ? currenciesFromFIRO : currenciesToFIRO"
                        :value="selectedCoinInfo"
                        :placeholder="spinner.currencies ? 'Loading coins...' : 'Select coin'"
                        :clearable="!spinner.currencies && !!selectedCoinInfo.coin"
                        :disabled="spinner.currencies"
                        @input="setSelected"
                    >
                        <template v-slot:spinner="loading">
                            <div class="spinner" v-if="loading">Loading...</div>
                        </template>
                        <template v-slot:option="option">
                            <div class="coin-option">
                                <CoinIcon :coin="option.coin" :width="25" :height="25" />
                                <div class="coin-short-name">{{ option.coin }}</div>
                                <div class="coin-name">{{ option.name }}</div>
                            </div>
                        </template>
                        <template v-slot:selected-option="option">
                            <div class="coin-option" v-if="option.coin">
                                <CoinIcon :coin="option.coin" :width="25" :height="25" />
                                <div class="coin-short-name">{{ option.coin }}</div>
                                <div class="coin-name">{{ option.name }}</div>
                            </div>
                        </template>
                    </vue-select>
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
                            v-tooltip="getValidationTooltip('amount')"
                            type="text"
                            name="amount"
                            class="amount"
                            tabindex="3"
                            :placeholder="swapType === 'from' ? `From ${isPrivate ? 'private' : 'public'} balance` : 'Amount'"
                            @keyup="changeAmont($event)"
                        />
                        <span class="tip ticker">
                            {{ getCurrency }}
                        </span>
                    </div>
                </div>

                <div class="field" id="address-field">
                    <label>
                        Your {{ selectedCoin }} {{ swapType === 'from' ? "destination" : "refund"}} address
                    </label>
                    <div class="input-with-tip-container">
                        <input
                            id="address"
                            ref="address"
                            v-model="address"
                            v-tooltip="getValidationTooltip('address')"
                            type="text"
                            name="address"
                            tabindex="2"
                            :placeholder="swapType === 'from' ? 'Destination address' : 'Refund address'"
                            @keyup="changeWallet($event)"
                        />
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

                        <div v-if="transactionFee" class="value"><span>{{ amountToReceive }}</span> <span class="ticker">{{ getCurrency_ }}</span></div>
                        <div v-else class="value" />
                    </div>

                    <div class="total-field" id="expected-rate">
                        <label>
                            Expected rate:
                        </label>

                        <div v-if="transactionFee" class="value"><span class="ticker">{{ sequence }}</span></div>
                        <div v-else class="value" />
                    </div>

                    <div class="total-field" id="transaction-fee">
                        <label>
                            Transaction fee:
                        </label>

                        <div v-if="transactionFee" class="value"><span>{{transactionFee}}</span> <span class="ticker">{{ getCurrency }}</span></div>
                        <div v-else class="value" />
                    </div>

                    <div class="total-field" id="total-amount">
                        <label>
                            Total:
                        </label>

                        <div v-if="transactionFee" class="value"><span>{{ totalAmount }}</span> <span class="ticker">{{ getCurrency }}</span></div>

                        <div v-else class="value" />
                    </div>

                    <div v-if="error" class="error">
                        {{ error }}
                    </div>
                </div>

                <SendFlow
                    :disabled="!canBeginSend"
                    :swap-type="swapType"
                    :is-private="isPrivate"
                    :label="`${this.getCurrentPair()}`"
                    :current-pair="`${this._getCurrentPair()}`"
                    :selectedCoin="selectedCoin"
                    :address="address"
                    :amount="+amount"
                    :satoshiAmount="satoshiAmount"
                    :tx-fee-per-kb="1"
                    :transactionFee="transactionFee"
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
</template>

<script>
import { mapGetters } from 'vuex';
import SendFlow from 'renderer/components/CoinSwapPage/SendFlow';
import { isValidAddress } from 'lib/isValidAddress';
import { convertToSatoshi, convertToCoin } from 'lib/convert';
import { ZcoindErrorResponse } from 'daemon/firod';
import { VueSelect } from 'vue-select';
import APIWorker from 'renderer/api/switchain-api';
import Utils from 'renderer/utils';
import LoadingBounce from 'renderer/components/Icons/LoadingBounce';
import CircularTimer from 'renderer/components/Icons/CircularTimer';
import CoinSwapHelper from 'lib/coinSwapHelper';
import CoinIcon from './CoinIcon';
import SwitchainIcon from 'renderer/components/Icons/SwitchainIcon';
import BackButtonIcon from 'renderer/components/Icons/BackButtonIcon';

const initialState = {
    swapType: 'from',
    selectedCoin: '',
    selectedCoinInfo: {},
    selectedBalance: { label: 'Public', value: 'public' },
    recipientWallet: '',
    refundWallet: '',
    sequence: '',
    passphrase: '',
    transactionFee: 0,
    error: null,
    address: '',
    amount: null,
    amountTo: 0,
    step: 1,
    swapPopoverStep: 'initial',
    amountMinError: false,
    amountMaxError: false,
    amountError: false,
    exchangeCreated: false,
    isPrivate: true,
    subtractFeeFromAmount: true
};

export default {
    name: 'CoinSwapDetail',

    components: {
        SendFlow,
        VueSelect,
        LoadingBounce,
        CircularTimer,
        CoinIcon,
        SwitchainIcon,
        BackButtonIcon
    },

    data() {
        return {
            api: null,
            spinner: {
                currencies: true
            },
            currenciesFromFIRO: [],
            currenciesToFIRO: [],
            marketInfo: [],
            balances: [
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' }
            ],
            ...initialState
        };
    },

    created() {
        this.api = new APIWorker();
    },

    async mounted() {
        const { error, response } = await this.api.getMarketInfo();

        const marketInfo = error ? [] : response;

        const allowedPairs = CoinSwapHelper.getAllowedCoinSwapPairs();
        const allowedPairsMap = {};

        allowedPairs.forEach(pair => {
            allowedPairsMap[pair.from + '-' + pair.to] = null;
        });

        marketInfo.forEach(({ pair }) => {
            const { from, to } = Utils.pairToObject({ pair });

            if (pair in allowedPairsMap && (from == 'XZC' || to == 'XZC')) {
                if (from == 'XZC') {
                    this.currenciesFromFIRO.push({ coin: to, name: this.$t('currencies.' + to) });
                } else {
                    this.currenciesToFIRO.push({ coin: from, name: this.$t('currencies.' + from) });
                }
            }
        });

        this.currenciesFromFIRO.sort((from1, from2) => {
            return from1.coin.localeCompare(from2.coin);
        });

        this.currenciesToFIRO.sort((to1, to2) => {
            return to1.coin.localeCompare(to2.coin);
        });

        this.marketInfo = marketInfo;
        this.spinner.currencies = false;
    },

    watch: {
        $route(to, from) {
            this.cleanupForm();
        }
    },

    computed: {
        ...mapGetters({
            selectedUtxos: 'ZcoinPayment/selectedInputs',
            totalBalance: 'Balance/total',
            availablePrivate: 'Balance/available',
            availablePublic: 'Balance/availablePublic',
        }),
        wallet() {
            return this.swapType === 'from' ? this.recipientWallet : this.refundWallet;
        },
        getValidationTooltip() {
            const getContent = fieldName => {
                if (fieldName === 'amount') {
                    const amount = Number(this.amount);

                    if (!(typeof amount === 'number' && !isNaN(amount))) {
                        return 'Invalid amount';
                    }

                    if (this.swapType === 'from' && convertToSatoshi(amount) > this.available) {
                        return `Amount Is Over Your Available ${this.isPrivate ? 'Private' : ''} Balance of ${convertToCoin(this.available)}`;
                    }

                    return this.renderFromLabel(fieldName);
                } else {
                    return `Invalid ${this.selectedCoin} Address`;
                }
            };

            const visible = fieldName => {
                if (fieldName === 'amount') {
                    const amount = Number(this.amount);

                    if (!(typeof amount === 'number' && !isNaN(amount))) {
                        return 'Invalid amount';
                    }

                    if (amount) {
                        if (this.swapType === 'from' && convertToSatoshi(amount) > this.available) {
                            return true;
                        }

                        return this.renderFromLabel(fieldName);
                    }

                    return false;
                } else {
                    return this.wallet ? !Utils.validateAddress(this.wallet, this.selectedCoin) : false;
                }
            };

            return fieldName => ({
                content: getContent(fieldName),
                trigger: 'manual',
                boundariesElement: 'body',
                offset: 8,
                placement: 'left',
                classes: 'error',
                show: visible(fieldName)
            });
        },
        satoshiAmount () {
            return convertToSatoshi(this.amount);
        },
        coinControl () {
            let coinControl;

            if (this.selectedUtxos && this.selectedUtxos.length > 0) {
                coinControl = this.selectedUtxos.map(element => [element.txid, element.txIndex]);
            }

            return coinControl;
        },
        amountToReceive() {
            const price = this.countPrice();

            return this.totalAmount * price;
        },
        canBeginSend() {
            if (this.selectedCoin && this.address && !isNaN(parseFloat(this.amount)) && !isNaN(this.amount - 0)) {
                const isValid = Utils.validateAddress(this.address, this.selectedCoin);

                return isValid && !this.error && !this.amountError && convertToSatoshi(this.amount) <= this.available;
            }

            return false;
        },
        available () {
            return this.isPrivate ? this.availablePrivate : this.availablePublic;
        },
        totalAmount () {
            return this.subtractFeeFromAmount ? this.amount : +this.amount + +this.transactionFee;
        },
        getCurrency() {
            return this.swapType === 'from' ? 'FIRO' : this.selectedCoin;
        },
        getCurrency_() {
            return this.swapType === 'from' ? this.selectedCoin : 'FIRO';
        }
    },

    methods: {
        convertToCoin,
        togglePrivatePublic() {
            const p = this.isPrivate;
            this.cleanupForm();
            this.isPrivate = !p;
        },
        beginWaitToConfirmStep() {
            this.swapPopoverStep = 'waitToConfirm';
        },
        beginConfirmStep() {
            this.swapPopoverStep = 'confirm';
        },
        beginPassphraseStep() {
            this.swapPopoverStep = 'passphrase';
        },
        closeSendPopover() {
            this.passphrase = '';
            this.swapPopoverStep = 'initial';
        },
        beginIncorrectPassphraseStep() {
            this.swapPopoverStep = 'incorrectPassphrase';
        },
        beginErrorStep(errorMessage) {
            this.errorMessage = errorMessage;
            this.swapPopoverStep = 'error';
        },
        beginCompleteStep() {
            this.swapPopoverStep = 'complete';
        },
        setSelected(value) {
            this.selectedCoinInfo = value;
            this.selectedCoin = value.coin;

            const { minerFee = 0 } = this.getMarketInfo();

            this.transactionFee = Number(minerFee);

            this.recountTo();
        },
        setBalance(value) {
            this.selectedBalance = value;
        },
        changeAmont(event, prop = 'amount') {
            this[prop] = event.target.value;

            this.recountTo(prop);
        },
        changeWallet(event) {
            if (this.swapType === 'from') {
                this.recipientWallet = event.target.value;
            } else {
                this.refundWallet = event.target.value;
            }
        },
        getCurrentPair() {
            return this.swapType === 'from' ? `FIRO-${this.selectedCoin}` : `${this.selectedCoin}-FIRO`;
        },
        _getCurrentPair() {
            return this.swapType === 'from' ? `XZC-${this.selectedCoin}` : `${this.selectedCoin}-XZC`;
        },
        getMarketInfo() {
            const currentPair = this._getCurrentPair();
            const marketInfo = this.marketInfo.find(({ pair }) => pair === currentPair);

            return marketInfo || {};
        },
        stepIsDisabled() {
            return this.amount && this.refundWallet;
        },
        cleanupForm() {
            for (let key in initialState) {
                this[key] = initialState[key];
            }
        },
        availableBalance(type) {
            return type === 'public' ? convertToCoin(this.availablePublic) : convertToCoin(this.availablePrivate);
        },
        maxSelect(type) {
            if (type === 'public') {
                this.amount = convertToCoin(this.availablePublic);
            } else {
                this.amount = convertToCoin(this.availablePrivate);
            }
        },
        renderFromLabel(fieldName = 'amount') {
            const from = this.swapType === 'from' ? 'FIRO' : this.selectedCoin;
            const hasError = this.amountMaxError || this.amountMinError;
            let error = this.amountMaxError ? `Maximum amount ${this.maxAmount} ${from}` : `Minimum amount ${this.minAmount} ${from}`;

            return hasError ? error : '';
        },
        async recountTo(prop) {
            this[`${prop}Error`] = '';

            if (this.marketInfo.length) {
                let amount = Number(this[prop]);

                try {
                    if (typeof amount === 'number' && !isNaN(amount)) {
                        const { quote, minerFee, minLimit, maxLimit } = this.getMarketInfo();

                        this.minAmount = minLimit;
                        this.maxAmount = maxLimit;

                        if (minLimit > amount) {
                            this[`${prop}MinError`] = true;
                            this[`${prop}Error`] = true;
                            this.sequence = '';
                            return;
                        }

                        if (maxLimit < amount) {
                            this[`${prop}Error`] = true;
                            this[`${prop}MaxError`] = true;
                            this.sequence = '';
                            return;
                        }

                        this[`${prop}MinError`] = false;
                        this[`${prop}MaxError`] = false;
                        this[`${prop}Error`] = false;
                        
                        this.amountTo = this.totalAmount * quote - minerFee;
                    } else {
                        this[`${prop}Error`] = true;
                    }
                } catch (error) {
                    this.amountTo = '-';
                } finally {
                    if (this.amountError || !this.selectedCoin) {
                        this.sequence = '';
                        return;
                    }

                    this.countSequence();
                }
            }
        },
        countPrice() {
            return this.amountTo && this.amountTo !== '-' && this.totalAmount ? Number(this.amountTo / this.totalAmount) : 0;
        },
        countSequence() {
            const price = this.countPrice();

            if (this.swapType === 'from') {
                this.sequence = `1 FIRO ≈ ${price || ''} ${this.selectedCoin}`;
            } else {
                this.sequence = `1 ${this.selectedCoin} ≈ ${price || ''} FIRO`;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'src/renderer/styles/inputs';
@import 'src/renderer/styles/sizes';
@import 'src/renderer/styles/typography';

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

.coin-swap-detail {
    width: $size-secondary-content-width;
    float: right;
    box-sizing: border-box;
    padding: $size-detail-margin;
    height: 100%;
    background-color: $color-detail-background;

    .title-wrapper {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        
        .logo-wrapper {
            height: 18px;
            display: flex;
            line-height: 18px;
            margin: auto 0;
        }
    }

    .inner {
        height: 100%;
        display: flex;
        flex-flow: column;

        #top {
            flex-grow: 1;

            .field {
                &:not(:first-child) {
                    margin-top: $size-between-field-space-big;
                }

                label,
                input[type='text'] {
                    display: block;
                }

                input[type='text'] {
                    @include wide-input-field();
                }

                &#address-field {
                    input {
                        @include address();
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

                    label,
                    .value {
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

    .radio-buttons-wrapper {
        display: flex;
        margin: 20px 0;

        .radio-button-wrapper {
            flex: 0 0 35%;
        }
    }

    .v-select {
        width: 335px;
    }

    .coin-option {
        display: flex;
        align-items: center;

        .coin-short-name {
            border: 1px solid rgba(34, 36, 38, 0.15);
            background-color: white;
            padding-top: 2px;
            padding-bottom: 2px;
            padding-left: 3px;
            padding-right: 2px;
            color: rgba(0, 0, 0, 0.87);
            border-radius: 5px;
            margin-left: 8px;
        }

        .coin-name {
            padding-left: 8px;
        }
    }
}
</style>
