<template>
    <section class="coin-swap-detail">
        <div class="inner">
            <div id="top">
                <header class="header-wrapper">
                    <div class="title-wrapper">
                        <h2 class="total-field">Coin Swap</h2>
                        <div class="logo-wrapper">Powered by <SwitchainIcon /></div>
                    </div>
                </header>

                <div class="radio-buttons-wrapper">
                    <label class="radio-button-wrapper">Swap from FIRO
                        <input type="radio" v-model="isSwapFrom" :value="true">
                        <span class="checkmark" />
                    </label>
                    <label class="radio-button-wrapper">Swap to FIRO
                        <input type="radio" v-model="isSwapFrom" :value="false">
                        <span class="checkmark" />
                    </label>
                </div>

                <div class="field" id="label-field">
                    <label>
                        {{ isSwapFrom ? 'Receive' : 'Send' }}
                    </label>

                    <!-- The use of option.coin below is a function of vue-select, wherein option[label] is set to the
                         selected value rather than option itself. -->
                    <vue-select
                        class="select"
                        label="coin"
                        v-model="selectedCoin"
                        :loading="!isMarketInfoLoaded"
                        :disabled="!isMarketInfoLoaded"
                        :options="remoteCoins"
                        :placeholder="isMarketInfoLoaded ? 'Select coin' : 'Loading coins...'"
                        :clearable="!!selectedCoin"
                    >
                        <template v-slot:spinner="loading">
                            <div class="spinner" v-if="loading">Loading...</div>
                        </template>

                        <template v-slot:option="option">
                            <div class="coin-option">
                                <CoinIcon :coin="option.coin" :width="25" :height="25" />
                                <div class="coin-short-name">{{ option.coin }}</div>
                                <div class="coin-name">{{ CoinNames[option.coin] }}</div>
                            </div>
                        </template>

                        <template v-slot:selected-option="option">
                            <div class="coin-option" v-if="option">
                                <CoinIcon :coin="option.coin" :width="25" :height="25" />
                                <div class="coin-short-name">{{ option.coin }}</div>
                                <div class="coin-name">{{ CoinNames[option.coin] }}</div>
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
                            v-validate="amountValidations"
                            v-tooltip="getValidationTooltip('amount')"
                            type="text"
                            :disabled="!selectedCoin"
                            name="amount"
                            class="amount"
                            tabindex="3"
                            :placeholder="isSwapFrom ? `From ${isPrivate ? 'private' : 'public'} balance` : 'Amount'"
                        />
                        <span class="tip ticker">
                            {{ isSwapFrom ? "FIRO" : selectedCoin }}
                        </span>
                    </div>
                </div>

                <div class="field" id="address-field">
                    <label>
                        Your {{ selectedCoin }} {{ isSwapFrom ? "destination" : "refund"}} address
                    </label>
                    <div class="input-with-tip-container">
                        <input
                            id="address"
                            ref="address"
                            v-model="address"
                            v-validate="`${selectedCoin}AddressIsValid`"
                            v-tooltip="getValidationTooltip('address')"
                            type="text"
                            name="address"
                            tabindex="2"
                            :disabled="!selectedCoin"
                            :placeholder="isSwapFrom ? 'Destination address' : 'Refund address'"
                            spellcheck="false"
                        />
                    </div>
                </div>
            </div>

            <div id="bottom">
                <div id="totals">
                    <div class="total-field" id="expected-rate">
                        <label>
                            Rate:
                        </label>

                        <div v-if="isMarketInfoLoaded && !!selectedCoin" class="value">
                            <span class="amount">1</span>
                            <span class="ticker">{{ isSwapFrom ? "FIRO" : selectedCoin }}</span>
                            =
                            <span class="amount">{{ conversionRate }}</span>
                            <span class="ticker">{{ isSwapFrom ? selectedCoin : "FIRO" }}</span>
                        </div>
                    </div>

                    <div v-if="isSwapFrom" class="total-field" id="firo-transaction-fee">
                        <label>
                            Firo Transaction fee:
                        </label>

                        <div class="value">
                            <div v-if="firoTransactionFee">
                                <span class="amount">{{ convertToCoin(firoTransactionFee) }}</span>
                                <span class="ticker">FIRO</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="selectedCoin" class="total-field" id="remote-transaction-fee">
                        <label>
                            {{ CoinNames[selectedCoin] }} Transaction Fee:
                        </label>

                        <div class="value">
                            <span class="amount">{{ remoteTransactionFee }}</span>
                            <span class="ticker">{{ selectedCoin }}</span>
                        </div>
                    </div>

                    <div class="total-field" id="total-amount">
                        <label>
                            You will receive:
                        </label>

                        <div  v-if="amountToReceive" class="value">
                            ~
                            <span class="amount">{{ amountToReceive }}</span>
                            <span class="ticker">{{ isSwapFrom ? selectedCoin : 'FIRO' }}</span>
                        </div>
                    </div>

                    <div v-if="firoTransactionFeeError" class="error">
                        {{ firoTransactionFeeError }}
                    </div>
                </div>

                <CoinSwapFlowFromFiro
                    v-if="isSwapFrom"
                    :disabled="!canBeginSwapFromFiro"
                    :is-private="isPrivate"
                    :remote-currency="selectedCoin"
                    :firo-transaction-fee="firoTransactionFee"
                    :tx-fee-per-kb="smartFeePerKb"
                    :remote-transaction-fee="remoteTransactionFee"
                    :firo-amount="satoshiAmount"
                    :remote-amount="amountToReceive"
                    :receive-address="address"
                    :expected-rate="conversionRate"
                    @success="cleanupForm"
                />

                <CoinSwapFlowToFiro
                    v-else
                    :disabled="!canBeginSwapToFiro"
                    :remote-currency="selectedCoin"
                    :remote-amount="amount"
                    :firo-amount="amountToReceive"
                    :firo-transaction-fee="remoteTransactionFee"
                    :refund-address="address"
                    :expected-rate="conversionRate"
                    @success="cleanupForm"
                />

                <div class="footer">
                    <PrivatePublicBalance @toggle="togglePrivatePublic" />
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import CryptoAddressValidator from '@swyftx/api-crypto-address-validator';
import Big from 'big.js';
import lodash from 'lodash';
import { mapGetters } from 'vuex';
import CoinSwapFlowFromFiro from 'renderer/components/CoinSwapPage/CoinSwapFlowFromFiro';
import CoinSwapFlowToFiro from "renderer/components/CoinSwapPage/CoinSwapFlowToFiro";
import { convertToSatoshi, convertToCoin } from 'lib/convert';
import { VueSelect } from 'vue-select';
import APIWorker from 'lib/switchain-api';
import LoadingBounce from 'renderer/components/Icons/LoadingBounce';
import CircularTimer from 'renderer/components/Icons/CircularTimer';
import CoinIcon from './CoinIcon';
import SwitchainIcon from 'renderer/components/Icons/SwitchainIcon';
import BackButtonIcon from 'renderer/components/Icons/BackButtonIcon';
import PrivatePublicBalance from "renderer/components/shared/PrivatePublicBalance";
import {FirodErrorResponse} from "daemon/firod";

// This is the list of currency pairs that we want to be available in the app. It is not necessarily symmetrical, and it
// is also not necessarily the case that all the pairs will be shown, eg. in the event that the server drops support for
// one of them.
const AllowedPairs = [
    "XZC-BTC",
    "XZC-ETH",
    "XZC-ZEC",
    "XZC-LTC",
    "XZC-XRP",
    "XZC-XLM",
    "XZC-BCHABC",
    "XZC-BNB",
    "XZC-USDT",
    "XZC-USDC",
    "XZC-DAI",
    "XZC-DASH",
    "XZC-DCR",
    "XZC-PAX",
    "XZC-TUSD",
    "BTC-XZC",
    "ETH-XZC",
    "ZEC-XZC",
    "LTC-XZC",
    "XRP-XZC",
    "XLM-XZC",
    "BCHABC-XZC",
    "BNB-XZC",
    "USDT-XZC",
    "USDC-XZC",
    "DAI-XZC",
    "DASH-XZC",
    "DCR-XZC",
    "PAX-XZC",
    "TUSD-XZC"
];

const CoinNames = {
    XZC: "Firo",
    BTC: "Bitcoin",
    ETH: "Ethereum",
    ZEC: "ZCash",
    LTC: "Litecoin",
    XRP: "Ripple",
    XLM: "Stellar",
    BCHABC: "Bitcoin Cash",
    BNB: "Binance Coin",
    USDT: "Tether",
    USDC: "USD Coin",
    DAI: "Dai",
    DASH: "Dash",
    DCR: "Decred",
    PAX: "Paxos Standard",
    TUSD: "True USD"
};

const AddressValidations = {};
for (const coin of ['BTC', 'BCH', 'ETH', 'ZEC', 'LTC', 'XLM', 'BNB', 'USDT', 'USDC', 'DASH', 'DCR', 'PAX', 'TUSD']) {
    AddressValidations[coin] = (address) => {
        try {
            return CryptoAddressValidator.validate(address, coin);
        } catch {
            // This case should never occur unless the library is updated to remove functionality or such, but it's
            // extremely important to catch errors so we'll check for it anyway.
            console.error(`No validator exists for ${coin}`);
            return false;
        }
    }
}
AddressValidations['BCHABC'] = AddressValidations['BCH'];

export default {
    name: 'CoinSwapDetail',

    components: {
        CoinSwapFlowToFiro,
        CoinSwapFlowFromFiro,
        VueSelect,
        LoadingBounce,
        CircularTimer,
        CoinIcon,
        SwitchainIcon,
        BackButtonIcon,
        PrivatePublicBalance
    },

    inject: [
        '$validator'
    ],

    data() {
        return {
            CoinNames,
            isPrivate: true,
            isSwapFrom: true,
            // This prevents the display of inaccurate transaction fees.
            calculatingFiroTransactionFee: false,
            // This is used to update market info when necessary.
            marketInfoRefreshNonce: 0,
            // This is used so we can clear an interval created on startup to refresh market info.
            refreshOffersIntervalId: null,

            selectedCoin: null,
            amount: '',
            address: ''
        };
    },

    beforeMount () {
        // Set up VeeValidator rules.

        this.$validator.extend('amountIsWithinAvailableBalance', {
            // this.availableXzc will still be reactively updated.
            getMessage: () => `Amount is over your available balance of ${convertToCoin(this.available)} FIRO`,

            validate: (value) => convertToSatoshi(value) <= this.available
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

        this.$validator.extend('privateAmountDoesntViolateSpendLimit', {
            getMessage: () =>
                `Due to private transaction spend limits, you may not spend more than 1001 FIRO (including fees) in one transaction`,

            validate: (value) => this.subtractFeeFromAmount ? convertToSatoshi(value) <= 1001e8 : convertToSatoshi(value) <= 1000.99e8
        });

        this.$validator.extend('privateAmountDoesntViolateInputLimits', {
            getMessage: () =>
                `Due to private transaction input limits, you can currently spend no more than ` +
                `${convertToCoin(this.maxPrivateSend)} FIRO in one transaction. Try minting a larger denomination.`,

            validate: (value) => convertToSatoshi(value) <= this.maxPrivateSend
        });

        for (const [currency, name] of Object.entries(CoinNames)) {
            this.$validator.extend(`${currency}AddressIsValid`, {
                getMessage: () => `Invalid ${name} Address`,
                // We make sure to check if we have a validation for the currency to make sure we fail closed.
                validate: (value) => !!(AddressValidations[currency] && AddressValidations[currency](value))
            });
        }

        // Additional validations are created in the watcher for marketInfo
    },

    created() {
        // Refresh market information every 30 seconds.
        this.refreshOffersIntervalId = setInterval(() => {
            this.marketInfoRefreshNonce++;
        }, 30e3);
    },

    destroyed() {
        clearInterval(this.refreshOffersIntervalId);
    },

    watch: {
        marketInfo() {
            if (!this.marketInfo) return;

            for (const [pair, info] of Object.entries(this.marketInfo)) {
                this.$validator.extend(`${pair}AmountDoesntViolateAPILimits`, {
                    getMessage: () => `Amount must be between ${info.minLimit} and ${info.maxLimit}`,
                    validate: (value) => {
                        let v;
                        try {
                            v = new Big(value);
                        } catch {
                            return false;
                        }

                        return v.gte(info.minLimit) && v.lte(info.maxLimit);
                    }
                })
            }
        }
    },

    asyncComputed: {
        marketInfo: {
            default: {},
            async get() {
                // The function associated with refreshOffersIntervalId will increment this every time we get close to
                // needing new market information.
                this.marketInfoRefreshNonce;

                this.$log.debug("Fetching market information...");

                const api = new APIWorker();
                const {error, response} = await api.getMarketInfo();
                if (error) return {}

                return lodash.fromPairs(
                    response
                        .filter(market => AllowedPairs.includes(market.pair))
                        .map(market => [market.pair, market])
                );
            }
        },

        // Returns [number (txfee in satoshi), error (string)], one of which will be null; or undefined if the amount
        // field is invalid or if it's not a swap from Firo.
        async firoTransactionFeeAndError() {
            this.calculatingFiroTransactionFee = true;

            if (!this.isSwapFrom) return;

            // The whole point of this dance is to prevent repeated calls to the daemon, which are unfortunately slow.
            const satoshiAmount = this.satoshiAmount;
            const isPrivate = this.isPrivate;

            if (!!this.getValidationTooltip('amount').content) return;
            if (!this.satoshiAmount) return;

            await new Promise(r => setTimeout(r, 1e3));
            if (!lodash.isEqual(
                [satoshiAmount, isPrivate],
                [this.satoshiAmount, this.isPrivate]
            )) return;

            try {
                if (this.isPrivate) {
                    if (this.isLelantusAllowed) {
                        return [await $daemon.calcLelantusTxFee(satoshiAmount, this.smartFeePerKb, false), null];
                    } else {
                        return [await $daemon.calcSigmaTxFee(satoshiAmount, false), null];
                    }
                } else {
                    return [await $daemon.calcPublicTxFee(satoshiAmount, false, this.smartFeePerKb), null];
                }
            } catch (e) {
                if (e instanceof FirodErrorResponse) {
                    return [null, e.errorMessage];
                } else {
                    return [null, `${e}`];
                }
            } finally {
                this.calculatingFiroTransactionFee = false;
            }
        }
    },

    computed: {
        ...mapGetters({
            totalBalance: 'Balance/total',
            availablePrivate: 'Balance/available',
            availablePublic: 'Balance/availablePublic',
            maxPrivateSend: 'Balance/maxPrivateSend',
            _smartFeePerKb: 'ApiStatus/smartFeePerKb'
        }),

        amountValidations () {
            if (!this.selectedCoin) {
                return '';
            } else if (this.isSwapFrom) {
                if (!this.isPrivate) {
                    return `${this.xzcPair}AmountDoesntViolateAPILimits|amountIsWithinAvailableBalance`;
                } else if (this.isLelantusAllowed) {
                    return `${this.xzcPair}AmountDoesntViolateAPILimits|amountIsWithinAvailableBalance|privateAmountDoesntViolateSpendLimit`;
                } else {
                    return `${this.xzcPair}AmountDoesntViolateAPILimits|amountIsWithinAvailableBalance|privateAmountIsValid|privateAmountIsWithinBounds|privateAmountDoesntViolateInputLimits`
                }
            } else {
                return `${this.xzcPair}AmountDoesntViolateAPILimits`;
            }
        },

        firoTransactionFee() {
            if (this.calculatingFiroTransactionFee) return;
            if (!this.selectedCoin) return;
            return this.firoTransactionFeeAndError && this.firoTransactionFeeAndError[0];
        },

        firoTransactionFeeError() {
            if (this.calculatingFiroTransactionFee) return;
            if (!this.selectedCoin) return;
            return this.firoTransactionFeeAndError && this.firoTransactionFeeAndError[1];
        },

        smartFeePerKb() {
            return Math.max(this._smartFeePerKb, 10);
        },

        // The information about the currently selected market, or undefined if marketInfo isn't loaded or no coin is
        // selected.
        // Returns:
        // {
        //     pair: string,     // CUR1-CUR2 eg. USDT-FIRO
        //     quote: string,    // the string-encoded rational number of currency CUR1 equal to CUR2, eg. "3.1415"
        //     expiryTs: number, // the UNIX timestamp until which the information is valid
        //     minerFee: number, // the satoshi amount miner fee
        //     minLimit: number, // the minimum amount of CUR1 that must be sent
        //     maxLimit: number, // the maximum amount of CUR1 that must be sent
        //     signature: string // a UUID representing the pair/quote
        // }
        currentMarketInfo() {
            return this.marketInfo[this.xzcPair];
        },

        // This is a string representation of the whole-coin amount of the remote currency taken as a transaction fee.
        remoteTransactionFee() {
            return this.currentMarketInfo && this.currentMarketInfo.minerFee;
        },

        isMarketInfoLoaded() {
            return Object.keys(this.marketInfo).length !== 0;
        },

        coinsFromFiro() {
            return Object.keys(this.marketInfo)
                .filter(pair => pair.match(/^XZC-/))
                .map(pair => pair.split('-')[1])
                .sort();
        },

        coinsToFiro() {
            return Object.keys(this.marketInfo)
                .filter(pair => pair.match(/-XZC$/))
                .map(pair => pair.split('-')[0])
                .sort();
        },

        remoteCoins() {
            return this.isSwapFrom ? this.coinsFromFiro : this.coinsToFiro;
        },

        firoPair() {
            return this.isSwapFrom ? `FIRO-${this.selectedCoin}` : `${this.selectedCoin}-FIRO`;
        },

        xzcPair() {
            return this.isSwapFrom ? `XZC-${this.selectedCoin}` : `${this.selectedCoin}-XZC`;
        },

        // We return a decimal-formatted string (or undefined).
        conversionRate() {
            return this.currentMarketInfo && this.currentMarketInfo.quote;
        },

        // This is a number in satoshi units of the remote currency.
        remoteCurrencyTransactionFee() {
            return this.currentMarketInfo && this.currentMarketInfo.minerFee;
        },

        getValidationTooltip() {
            return (fieldName) => ({
                content: this.validationErrors.first(fieldName),
                trigger: 'manual',
                boundariesElement: 'body',
                offset: 8,
                placement: 'left',
                classes: 'error',
                show: true
            })
        },

        satoshiAmount () {
            return convertToSatoshi(this.amount);
        },

        // We return a string equal to whatever whole-coin amount we expect to receive (either in FIRO or in selectedCoin).
        amountToReceive() {
            if (!this.currentMarketInfo) return;
            if (!this.satoshiAmount) return;

            if (this.isSwapFrom) {
                if (!this.firoTransactionFee) return;

                const conversionRate = new Big(this.conversionRate);
                const firoAmount = new Big(this.satoshiAmount) / 1e8;
                const firoTxFee = new Big(this.firoTransactionFee) / 1e8;
                const remoteTransactionFee = new Big(this.remoteTransactionFee);

                const amountToReceive = (firoAmount - firoTxFee) * conversionRate - remoteTransactionFee;
                return amountToReceive.toPrecision(8);
            } else {
                const conversionRate = new Big(this.conversionRate);
                // We use amount directly instead of satoshiAmount because the remote currency may have >8 decimal
                // places of precision.
                const remoteAmount = new Big(this.amount);
                const remoteTxFee = new Big(this.remoteTransactionFee);

                const amountToReceive = remoteAmount * conversionRate - remoteTxFee;
                return amountToReceive.toPrecision(8);
            }
        },

        canBeginSwapFromFiro() {
            return !this.calculatingFiroTransactionFee && this.firoTransactionFee && this.selectedCoin && this.amount && this.address && !this.validationErrors.items.length;
        },

        canBeginSwapToFiro() {
            return this.selectedCoin && this.amount && this.address && !this.validationErrors.items.length;
        },

        available () {
            return this.isPrivate ? this.availablePrivate : this.availablePublic;
        },
    },

    methods: {
        convertToCoin,

        togglePrivatePublic(isPrivate) {
            this.cleanupForm();
            this.isPrivate = isPrivate;
        },

        cleanupForm() {
            this.isPrivate = true;
            this.selectedCoin = null;
            this.amount = '';
            this.address = ''
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

.amount {
    @include amount();
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
        }
    }

    .radio-buttons-wrapper {
        display: flex;
        justify-content: space-between;
    }

    .v-select {
        width: $size-large-field-width;
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
