<template>
    <section class="coin-swap-detail detail">
        <div class="inner">
            <div class="top">
                <div class="from-to-select">
                    <div class="checkbox-field">
                        <input type="radio" v-model="isSwapFrom" :value="true" />
                        <label>Swap from FIRO</label>
                    </div>

                    <div class="checkbox-field">
                        <input type="radio" v-model="isSwapFrom" :value="false">
                        <label>Swap to FIRO</label>
                    </div>
                </div>

                <Dropdown
                    label-text="Exchange Provider"
                    :disabled="formDisabled"
                    :options="remoteChains"
                    v-model="chainName"
                />

                <Dropdown
                    :label-text="isSwapFrom ? 'Receive' : 'Send'"
                    :disabled="formDisabled || isProviderUnavailable || doesProviderNotSupportFiro || !isMarketInfoLoaded"
                    :loading="!isProviderUnavailable && !doesProviderNotSupportFiro && !isMarketInfoLoaded"
                    :empty-text="(isProviderUnavailable && 'Provider is unavailable') || (doesProviderNotSupportFiro && 'Firo swaps are unavailable') || (!isMarketInfoLoaded && 'Loading coins...')  || 'Select coin'"
                    :options="remoteCoins"
                    v-model="selectedCoin"
                />

                <InputFrame label="Amount" :unit="isSwapFrom ? 'FIRO' : selectedCoin">
                    <input
                        id="amount"
                        ref="amount"
                        v-model="amount"
                        v-validate="amountValidations"
                        v-tooltip="getValidationTooltip('amount')"
                        type="text"
                        :disabled="formDisabled || !selectedCoin || !isCurrentMarketInfoLoaded"
                        name="amount"
                        class="amount"
                        tabindex="3"
                    />
                </InputFrame>

                <InputFrame :label="`${selectedCoin ? `${selectedCoin} ` : ''}${isSwapFrom ? ' Destination' : ' Refund'} Address`">
                    <input
                        id="address"
                        ref="address"
                        v-model="address"
                        v-validate="`${selectedCoin}AddressIsValid`"
                        v-tooltip="getValidationTooltip('address')"
                        type="text"
                        name="address"
                        tabindex="2"
                        :disabled="formDisabled || !selectedCoin"
                        spellcheck="false"
                    />
                </InputFrame>

                <div class="totals">
                    <div class="total-field">
                        <label>Rate:</label>

                        <div v-if="isMarketInfoLoaded && !!selectedCoin" class="value">
                            <span class="amount">1</span>
                            <span class="ticker">{{ isSwapFrom ? "FIRO" : selectedCoin }}</span>
                            =
                            <span class="amount">{{ conversionRate }}</span>
                            <span class="ticker">{{ isSwapFrom ? selectedCoin : "FIRO" }}</span>
                        </div>
                    </div>

                    <div v-if="isSwapFrom" class="total-field">
                        <label>Firo Transaction fee:</label>

                        <div class="value">
                            <div v-if="firoTransactionFee">
                                <span class="amount">{{ bigintToString(firoTransactionFee) }}</span>
                                <span class="ticker">FIRO</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="selectedCoin && chainName !== 'StealthEx' && chainName !=='Swapzone' && chainName !=='Exolix'" class="total-field">
                        <label>{{ CoinNames[selectedCoin] }} Transaction Fee:</label>

                        <div class="value">
                            <span class="amount">{{ remoteTransactionFee }}</span>
                            <span class="ticker">{{ isSwapFrom ? selectedCoin : "FIRO" }}</span>
                        </div>
                    </div>

                    <div class="total-field" id="total-amount">
                        <label>You will receive:</label>

                        <div  v-if="amountToReceive" class="value">
                            ~
                            <span class="amount">{{ amountToReceive }}</span>
                            <span class="ticker">{{ isSwapFrom ? selectedCoin : 'FIRO' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bottom">
                <CoinSwapFlowFromFiro
                    v-if="isSwapFrom"
                    :disabled="formDisabled || !canBeginSwapFromFiro"
                    :is-private="isPrivate"
                    :chain-name="chainName"
                    :remote-currency="selectedCoin"
                    :firo-transaction-fee="firoTransactionFee"
                    :tx-fee-per-kb="smartFeePerKb"
                    :remote-transaction-fee="remoteTransactionFee"
                    :firo-amount="satoshiAmount"
                    :remote-amount="amountToReceive"
                    :receive-address="address"
                    :expected-rate="conversionRate"
                    :quota-id="quotaId"
                    :class="{disabled: formDisabled}"
                    @reset="cleanupForm"
                    @success="cleanupForm"
                />

                <CoinSwapFlowToFiro
                    v-else
                    :disabled="formDisabled || !canBeginSwapToFiro"
                    :chain-name="chainName"
                    :remote-currency="selectedCoin"
                    :remote-amount="amount"
                    :firo-amount="amountToReceive"
                    :firo-transaction-fee="remoteTransactionFee"
                    :refund-address="address"
                    :expected-rate="conversionRate"
                    :quota-id="quotaId"
                    @reset="cleanupForm"
                    @success="cleanupForm"
                />

                <div class="footer">
                    <PrivatePublicBalance v-model="isPrivate" asset="FIRO" :disabled="false && !isSwapFrom || !isBlockchainSynced" />
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import Popup from 'renderer/components/shared/Popup';
import CoinSwapChain from 'renderer/components/CoinSwapPage/CoinSwapChain';
import CryptoAddressValidator from '@swyftx/api-crypto-address-validator';
import Big from 'big.js';
import lodash from 'lodash';
import { mapGetters } from 'vuex';
import CoinSwapFlowFromFiro from 'renderer/components/CoinSwapPage/CoinSwapFlowFromFiro';
import CoinSwapFlowToFiro from "renderer/components/CoinSwapPage/CoinSwapFlowToFiro";
import { bigintToString, stringToBigint } from 'lib/convert';
import ChangeAPIWorker from 'lib/changenow-api';
import StealthAPIWorker from 'lib/stealth-api';
import SwapzoneAPIWorker from 'lib/swapzone-api';
import ExolixAPIWorker from 'lib/exolix-api';
import LoadingBounce from 'renderer/components/Icons/LoadingBounce';
import CircularTimer from 'renderer/components/Icons/CircularTimer';
import SwitchainIcon from 'renderer/components/Icons/SwitchainIcon';
import BackButtonIcon from 'renderer/components/Icons/BackButtonIcon';
import PrivatePublicBalance from "renderer/components/shared/PrivatePublicBalance";
import {FirodErrorResponse} from "daemon/firod";
import InputFrame from "renderer/components/shared/InputFrame";
import Dropdown from "renderer/components/shared/Dropdown";

import FIROIcon from "renderer/assets/CoinIcons/FIRO.svg.data";
import BCHIcon from "renderer/assets/CoinIcons/BCH.svg.data";
import BNBIcon from "renderer/assets/CoinIcons/BNB.svg.data";
import BTCIcon from "renderer/assets/CoinIcons/BTC.svg.data";
import DAIIcon from "renderer/assets/CoinIcons/DAI.svg.data";
import DASHIcon from "renderer/assets/CoinIcons/DASH.svg.data";
import DCRIcon from "renderer/assets/CoinIcons/DCR.svg.data";
import ETHIcon from "renderer/assets/CoinIcons/ETH.svg.data";
import KMDIcon from "renderer/assets/CoinIcons/KMD.svg.data";
import LTCIcon from "renderer/assets/CoinIcons/LTC.svg.data";
import PAXIcon from "renderer/assets/CoinIcons/PAX.svg.data";
import USDCIcon from "renderer/assets/CoinIcons/USDC.svg.data";
import USDTIcon from "renderer/assets/CoinIcons/USDT.svg.data";
import XLMIcon from "renderer/assets/CoinIcons/XLM.svg.data";
import XRPIcon from "renderer/assets/CoinIcons/XRP.svg.data";
import ZECIcon from "renderer/assets/CoinIcons/ZEC.svg.data";

const CoinIcons = {
    FIRO: FIROIcon,
    BCH: BCHIcon,
    BTC: BTCIcon,
    ETH: ETHIcon,
    KMD: KMDIcon,
    ZEC: ZECIcon,
    LTC: LTCIcon,
    XRP: XRPIcon,
    XLM: XLMIcon,
    BNB: BNBIcon,
    BNBBSC: BNBIcon,
    USDT: USDTIcon,
    USDTBSC: USDTIcon,
    USDTERC20: USDTIcon,
    USDC: USDCIcon,
    DAI: DAIIcon,
    DASH: DASHIcon,
    DCR: DCRIcon,
    PAX: PAXIcon,
};

// This is the list of currency pairs that we want to be available in the app. It is not necessarily symmetrical, and it
// is also not necessarily the case that all the pairs will be shown, eg. in the event that the server drops support for
// one of them.
const AllowedPairs = [
    "FIRO-BTC",
    "FIRO-ETH",
    "FIRO-ZEC",
    "FIRO-LTC",
    "FIRO-XRP",
    "FIRO-XLM",
    "FIRO-BNB",
    "FIRO-BNBBSC",
    "FIRO-USDT",
    "FIRO-USDTBSC",
    "FIRO-USDTERC20",
    "FIRO-USDC",
    "FIRO-DAI",
    "FIRO-DASH",
    "FIRO-DCR",
    "FIRO-PAX",
    "FIRO-KMD",
    "FIRO-BCH",
    "BTC-FIRO",
    "ETH-FIRO",
    "ZEC-FIRO",
    "LTC-FIRO",
    "XRP-FIRO",
    "XLM-FIRO",
    "BNB-FIRO",
    "BNBBSC-FIRO",
    "USDT-FIRO",
    "USDTBSC-FIRO",
    "USDTERC20-FIRO",
    "USDC-FIRO",
    "DAI-FIRO",
    "DASH-FIRO",
    "DCR-FIRO",
    "PAX-FIRO",
    "KMD-FIRO",
    "BCH-FIRO",
];

const CoinNames = {
    FIRO: "Firo",
    BTC: "Bitcoin",
    ETH: "Ethereum",
    ZEC: "ZCash",
    LTC: "Litecoin",
    XRP: "Ripple",
    XLM: "Stellar",
    BNB: "Binance Coin",
    BNBBSC: "BNB Smart Chain",
    USDT: "Tether",
    USDTBSC: "Tether (BSC)",
    USDTERC20: "Tether (ERC20)",
    USDC: "USD Coin",
    DAI: "Dai",
    DASH: "Dash",
    DCR: "Decred",
    PAX: "Paxos Standard",
    KMD: "Komodo",
    BCH: "Bitcoin Cash"
};

const ChainOptions = [
    {id: "ChangeNow", name: "ChangeNow"},
    {id: "StealthEx", name: "StealthEx"},
    {id: "Swapzone", name: "Swapzone"},
    {id: "Exolix", name: "Exolix"},
];

const AddressValidations = {};
for (const coin of ['BTC', 'ETH', 'ZEC', 'LTC', 'XRP', 'XLM', 'BNB', 'USDT', 'USDC', 'DASH', 'DCR', 'PAX']) {
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
for (const coin of ["DAI", "BNBBSC", "USDTBSC", "USDTERC20"]) {
    AddressValidations[coin] = (address) => CryptoAddressValidator.validate(address, 'ETH');
}

const DEFAULT_CHAIN = "ChangeNow";

export default {
    name: 'CoinSwapDetail',

    components: {
        Dropdown,
        Popup,
        CoinSwapChain,
        InputFrame,
        CoinSwapFlowToFiro,
        CoinSwapFlowFromFiro,
        LoadingBounce,
        CircularTimer,
        SwitchainIcon,
        BackButtonIcon,
        PrivatePublicBalance
    },

    inject: [
        '$validator'
    ],

    data() {
        return {
            changeAPI: null,
            stealthAPI: null,
            swapzoneAPI: null,
            exolixAPI: null,
            chainName: DEFAULT_CHAIN,
            quotaId: null,
            show:"button",
            ChainOptions,
            CoinNames,
            isPrivate: true,
            isSwapFrom: true,
            // This is used to update market info when necessary.
            marketInfoRefreshNonce: 0,
            // This is used so we can clear an interval created on startup to refresh market info.
            refreshOffersIntervalId: null,
            selectedChain: null,
            selectedCoin: '',
            amount: '',
            address: ''
        };
    },

    beforeMount () {
        // Refresh market information every 60 seconds.
        this.refreshOffersIntervalId = setInterval(() => {
            this.marketInfoRefreshNonce++;
        }, 60e3);

        this.changeAPI = new ChangeAPIWorker();
        this.stealthAPI = new StealthAPIWorker();
        this.swapzoneAPI = new SwapzoneAPIWorker();
        this.exolixAPI = new ExolixAPIWorker();

        // Set up VeeValidator rules.

        this.$validator.extend('amountIsWithinAvailableBalance', {
            // this.availablefiro will still be reactively updated.
            getMessage: () => `Amount is over your available balance of ${bigintToString(this.available)} FIRO`,

            validate: (value) => stringToBigint(value) <= this.available
        });

        this.$validator.extend('privateAmountDoesntViolateSpendLimit', {
            getMessage: () =>
                `Due to private transaction spend limits, you may not spend more than 1001 FIRO (including fees) in one transaction`,

            validate: (value) => this.subtractFeeFromAmount ? stringToBigint(value) <= 100100000000n : bigintToString(value) <= 100099000000n
        });

        for (const [currency, name] of Object.entries(CoinNames)) {
            this.$validator.extend(`${currency}AddressIsValid`, {
                getMessage: () => `Invalid ${name} Address`,
                // We make sure to check if we have a validation for the currency to make sure we fail closed.
                validate: (value) => !!(AddressValidations[currency] && AddressValidations[currency](value))
            });
        }

        // Additional validations are created in the watcher for currentMarketInfo
    },

    destroyed() {
        clearInterval(this.refreshOffersIntervalId);
    },

    watch: {
        currentMarketInfo() {
            if (!this.marketInfo) return;

            for (const [pair, info] of Object.entries(this.marketInfo)) {
                this.$validator.extend(`${pair}AmountDoesntViolateAPILimits`, {
                    getMessage: () => `Amount must be between ${info.min} and ${info.max}`,
                    validate: (value) => {
                        let v;
                        try {
                            v = new Big(value);
                        } catch {
                            return false;
                        }
                        return v.gte(info.min) && v.lte(info.max);
                    }
                })
            }
        },

        isCurrentMarketInfoLoaded() {
            return !!(this.currentMarketInfo && !this.currentMarketInfo._isLoading);
        },

        isPrivate() {
            this.cleanupForm(false);
        },

        chainName() {
            this.selectedCoin = null;
        }
    },

    asyncComputed: {
        marketInfo: {
            default: {_isLoading: true},
            async get() {
                // The function associated with refreshOffersIntervalId will increment this every time we get close to
                // needing new market information.
                this.marketInfoRefreshNonce;

                this.$log.silly("Fetching market information...");

                let response;
                let marketInfo;
                if (this.chainName === "ChangeNow") {
                    try {
                        const mi = await this.changeAPI.getMarketInfo();
                        if (mi.error) throw mi.error;
                        response = mi.response;
                    } catch (error) {
                        console.warn(`Error fetching ChangeNow currency info: ${error}`);
                        setTimeout(() => this.marketInfoRefreshNonce++, 10e3);
                        return {_providerIsUnavailable: true};
                    }
                    this.$log.silly("Got ChangeNow currency information.");

                    marketInfo = lodash.fromPairs([
                        ...response
                            .filter(market => AllowedPairs.includes("FIRO-"+market.to.toUpperCase()) && market.from === "firo")
                            .map(market => ["FIRO-"+market.to.toUpperCase(), market]),
                        ...response
                            .filter(market => AllowedPairs.includes(market.from.toUpperCase()+"-FIRO") && market.to === "firo")
                            .map(market => [market.from.toUpperCase()+"-FIRO", market])
                    ]);

                    if (!Object.keys(marketInfo).length) {
                        this.$log.error("ChangeNow doesn't seem to support FIRO now.");
                        return {_providerDoesntSupportFiro: true};
                    }
                } else if (this.chainName === "StealthEx" ){
                    try {
                        response = await this.stealthAPI.getMarketInfo();
                    } catch (error) {
                        console.warn(`Error fetching StealthTx currency info: ${error}`);
                        setTimeout(() => this.marketInfoRefreshNonce++, 10e3);
                        return {_providerIsUnavailable: true};
                    }
                    this.$log.silly("Got Stealth currency information.");

                    marketInfo = lodash.fromPairs([
                        ...response
                            .filter(market => AllowedPairs.includes("FIRO-"+market.toUpperCase().replace("-","")))
                            .map(market => ["FIRO-"+market.toUpperCase().replace("-",""), market]),
                        ...response
                            .filter(market => AllowedPairs.includes(market.toUpperCase().replace("-","")+"-FIRO"))
                            .map(market => [market.toUpperCase().replace("-","")+"-FIRO", market])
                    ]);

                    if (!Object.keys(marketInfo).length) {
                        this.$log.error("Stealth doesn't seem to support FIRO now.");
                        return {_providerDoesntSupportFiro: true};
                    }

                } else if (this.chainName === "Swapzone"){
                    try {
                        const mi = await this.swapzoneAPI.getMarketInfo();
                        if (mi.error) throw mi.error;
                        response = mi.response;
                    } catch (error) {
                        console.warn(`Error fetching Swapzone currency info: ${error}`);
                        setTimeout(() => this.marketInfoRefreshNonce++, 10e3);
                        return {_providerIsUnavailable: true};
                    }
                    this.$log.silly("Got Stealth currency information.");

                    marketInfo = lodash.fromPairs([
                        ...response
                            .filter(market => AllowedPairs.includes(`FIRO-${market.ticker.toUpperCase()}`))
                            .map(market => [`FIRO-${market.ticker.toUpperCase()}`, market]),
                        ...response
                            .filter(market => AllowedPairs.includes(market.ticker.toUpperCase().replace("-","")+"-FIRO"))
                            .map(market => [`FIRO-${market.ticker.toUpperCase()}`, market])
                    ]);

                    if (!Object.keys(marketInfo).length) {
                        this.$log.error("Swapzone doesn't seem to support FIRO now.");
                        return {_providerDoesntSupportFiro: true};
                    }
                } else if (this.chainName === "Exolix"){
                    try {
                        const mi = await this.exolixAPI.getMarketInfo();
                        if (mi.error) throw mi.error;
                        response = mi.response;
                    } catch (error) {
                        console.warn(`Error fetching Exolix currency info: ${error}`);
                        setTimeout(() => this.marketInfoRefreshNonce++, 10e3);
                        return {_providerIsUnavailable: true};
                    }
                    this.$log.silly("Got Exolix currency information.");

                    marketInfo = lodash.fromPairs([
                        ...response.filter(market => AllowedPairs.includes("FIRO-"+market.code))
                            .map(market => ["FIRO-"+market.code, market]),
                        ...response.filter(market => AllowedPairs.includes(market.code+"-FIRO"))
                            .map(market => [market.code+"-FIRO", market])
                    ]);

                    if (!Object.keys(marketInfo).length) {
                        this.$log.error("Exolix doesn't seem to support FIRO now.");
                        return {_providerDoesntSupportFiro: true};
                    }
                }

                return marketInfo
            }
        }
    },

    computed: {
        ...mapGetters({
            availablePrivate: 'Balance/availablePrivate',
            availablePublic: 'Balance/availablePublic',
            maxPrivateSend: 'Balance/maxPrivateSend',
            isBlockchainSynced: 'ApiStatus/isBlockchainSynced',
            isLelantusAllowed: 'ApiStatus/isLelantusAllowed',
            calculateTransactionFee: 'Transactions/calculateTransactionFee',
            smartFeePerKb: 'ApiStatus/smartFeePerKb'
        }),

        firoTransactionFee() {
            if (!this.isSwapFrom || !this.satoshiAmount) return 0;
            return this.calculateTransactionFee(this.isPrivate, this.satoshiAmount, this.smartFeePerKb, false);
        },

        formDisabled() {
            return (!this.isBlockchainSynced || (this.isPrivate && !this.isLelantusAllowed));
        },

        amountValidations () {
            if (!this.selectedCoin) {
                return '';
            } else if (this.isSwapFrom) {
                if (this.isPrivate) {
                    return `${this.firoPair}AmountDoesntViolateAPILimits|amountIsWithinAvailableBalance|privateAmountDoesntViolateSpendLimit`;
                } else {
                    return `${this.firoPair}AmountDoesntViolateAPILimits|amountIsWithinAvailableBalance`;
                }
            } else {
                if (this.chainName === "ChangeNow"){
                    return `${this.firoPair}AmountDoesntViolateAPILimits`;
                } else {
                    return `currentAmountDoesntViolateAPILimits`;
                }
            }
        },

        // This is a string representation of the whole-coin amount of the remote currency taken as a transaction fee.
        remoteTransactionFee() {
            return (new Big(this.currentMarketInfo?.minerFee || 0)).toPrecision(8);
        },

        isMarketInfoLoaded() {
            return this.marketInfo && !this.marketInfo._isLoading;
        },

        isProviderUnavailable() {
            return this.marketInfo?._providerIsUnavailable;
        },

        doesProviderNotSupportFiro() {
            return this.marketInfo?._providerDoesntSupportFiro;
        },

        pairs() {
            if (!this.marketInfo || this.marketInfo._isLoading) return [];
            return Object.keys(this.marketInfo).filter(pair => AllowedPairs.includes(pair));
        },

        coinsFromFiro() {
            return this.pairs
                .map(pair => pair.split('-')[1])
                .filter(coin => coin !== 'FIRO')
                .sort();
        },

        coinsToFiro() {
            return this.pairs
                .map(pair => pair.split('-')[0])
                .filter(coin => coin !== 'FIRO')
                .sort();
        },

        remoteChains() {
            return ChainOptions;
        },

        remoteCoins() {
            return (this.isSwapFrom ? this.coinsFromFiro : this.coinsToFiro).map(coin => ({
                id: coin,
                icon: CoinIcons[coin],
                name: CoinNames[coin]
            }));
        },

        firoPair() {
            if (!this.selectedCoin) return '';
            return this.isSwapFrom ? `FIRO-${this.selectedCoin}` : `${this.selectedCoin}-FIRO`;
        },

        // We return a decimal-formatted string (or undefined).
        conversionRate() {
            return this.currentMarketInfo && (new Big(this.currentMarketInfo?.rate || 0)).toPrecision(8);
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
            return stringToBigint(this.amount);
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
            return this.firoTransactionFee && this.selectedCoin && this.amount && this.address && !this.validationErrors.items.length;
        },

        canBeginSwapToFiro() {
            return this.selectedCoin && this.amount && this.address && !this.validationErrors.items.length;
        },

        available () {
            return this.isPrivate ? this.availablePrivate : this.availablePublic;
        },

        currentMarketInfo() {
            return this.marketInfo[this.firoPair];
        },

        isCurrentMarketInfoLoaded() {
            return !!this.currentMarketInfo;
        }
    },

    methods: {
        bigintToString,

        cleanupForm(enablePrivate=true) {
            if (enablePrivate) this.isPrivate = true;
            this.amount = '';
            this.address = ''
            this.error = null;
            this.chainName = DEFAULT_CHAIN;
            this.selectedCoin = null;
        }
    }
};
</script>

<style lang="scss" scoped>
.coin-swap-detail {
    padding: var(--padding-base);
    height: 100%;
    background-color: var(--color-background-detail);

    .inner {
        height: 100%;
        display: flex;
        flex-flow: column;

        .top {
            flex-grow: 1;

            .from-to-select {
                margin-bottom: var(--padding-base);
                display: flex;

                .checkbox-field {
                    &:not(:first-child) {
                        margin-left: var(--padding-base);
                    }
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
                    &:not(:first-child) {
                        margin-top: 0.5em;
                    }

                    display: flex;
                    justify-content: space-between;
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
</style>
