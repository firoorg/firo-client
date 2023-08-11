<template>
    <section :class="['coin-swap-detail', 'detail', formDisabled ? 'disabled' : 'enabled']">
        <Form ref='form' as='div' class='inner' :validation-schema='validationSchema' v-slot='{errors, meta}'>
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
                    :options="ChainOptions"
                    v-model="provider"
                />

                <Dropdown
                    :label-text="isSwapFrom ? 'Receive' : 'Send'"
                    :disabled="formDisabled || isProviderUnavailable || doesProviderNotSupportFiro || !isCurrentMarketInfoLoaded"
                    :loading="!isProviderUnavailable && !doesProviderNotSupportFiro && !isCurrentMarketInfoLoaded"
                    :empty-text="(isProviderUnavailable && 'Error fetching data') || (doesProviderNotSupportFiro && 'Firo swaps are unavailable') || (!isCurrentMarketInfoLoaded && 'Loading coins...')  || 'Select coin'"
                    :options="remoteCoins"
                    v-model="selectedCoin"
                />

                <InputFrame label="Amount" :unit="isSwapFrom ? 'FIRO' : selectedCoin">
                    <Field
                        id="amount"
                        ref="amount"
                        v-model="amount"
                        v-tooltip="errors.amount"
                        type="text"
                        :disabled="formDisabled || !selectedCoin || !isCurrentMarketInfoLoaded"
                        name="amount"
                        class="amount"
                        :validate-on-input="true"
                    />
                </InputFrame>

                <InputFrame :label="`${selectedCoin ? `${selectedCoin} ` : ''}${isSwapFrom ? ' Destination' : ' Refund'} Address`">
                    <Field
                        id="address"
                        ref="address"
                        v-model="address"
                        v-tooltip="errors.address"
                        type="text"
                        name="address"
                        :disabled="formDisabled || !selectedCoin || !isCurrentMarketInfoLoaded"
                        spellcheck="false"
                        :validate-on-input='true'
                    />
                </InputFrame>

                <div class="totals">
                    <div class="total-field">
                        <label>Rate:</label>

                        <div v-if="!this.marketInfo._isLoading && !!selectedCoin" class="value">
                            <span class="amount">1</span>
                            <span class="ticker">{{ isSwapFrom ? "FIRO" : selectedCoin }}</span>
                            =
                            <span class="amount">{{ bigintToString(conversionRate) }}</span>
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

                    <div v-if="selectedCoin" class="total-field">
                        <label>{{ CoinNames[selectedCoin] }} Transaction Fee:</label>

                        <div class="value">
                            <span class="amount">{{ bigintToString(remoteTransactionFee) }}</span>
                            <span class="ticker">{{ isSwapFrom ? selectedCoin : "FIRO" }}</span>
                        </div>
                    </div>

                    <div class="total-field" id="total-amount">
                        <label>You will receive:</label>

                        <div  v-if="amountToReceive" class="value">
                            ~
                            <span class="amount">{{ bigintToString(amountToReceive) }}</span>
                            <span class="ticker">{{ isSwapFrom ? selectedCoin : 'FIRO' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bottom">
                <CoinSwapFlowFromFiro
                    v-if="isSwapFrom"
                    :disabled='!!(formDisabled || !address || !amount || Object.keys(errors).length)'
                    :is-private="isPrivate"
                    :provider="provider"
                    :remote-currency="selectedCoin"
                    :firo-transaction-fee="firoTransactionFee"
                    :tx-fee-per-kb="smartFeePerKb"
                    :remote-transaction-fee="remoteTransactionFee"
                    :firo-amount="satoshiAmount"
                    :remote-amount="amountToReceive"
                    :receive-address="address"
                    :expected-rate="conversionRate"
                    :quota-id="quotaId"
                    @reset="cleanupForm"
                    @success="cleanupForm"
                />

                <CoinSwapFlowToFiro
                    v-else
                    :disabled="!!(formDisabled || !address || !amount || Object.keys(errors).length)"
                    :provider="provider"
                    :remote-currency="selectedCoin"
                    :remote-amount="stringToBigint(amount)"
                    :firo-amount="amountToReceive"
                    :firo-transaction-fee="remoteTransactionFee"
                    :refund-address="address"
                    :expected-rate="conversionRate"
                    :quota-id="quotaId"
                    @reset="cleanupForm"
                    @success="cleanupForm"
                />

                <div class="footer">
                    <PrivatePublicBalance v-model="isPrivate" asset="FIRO" :disabled="!isSwapFrom || !isBlockchainSynced" />
                </div>
            </div>
        </Form>
    </section>
</template>

<script>
import {Form, Field} from 'vee-validate';
import Popup from 'renderer/components/shared/Popup.vue';
import CryptoAddressValidator from '@swyftx/api-crypto-address-validator';
import lodash from 'lodash';
import { mapGetters } from 'vuex';
import CoinSwapFlowFromFiro from 'renderer/components/CoinSwapPage/CoinSwapFlowFromFiro.vue';
import CoinSwapFlowToFiro from "renderer/components/CoinSwapPage/CoinSwapFlowToFiro.vue";
import { bigintToString, stringToBigint } from 'lib/convert';
import ChangeAPIWorker from 'lib/changenow-api';
import StealthAPIWorker from 'lib/stealth-api';
import SwapzoneAPIWorker from 'lib/swapzone-api';
import ExolixAPIWorker from 'lib/exolix-api';
import LoadingBounce from 'renderer/components/Icons/LoadingBounce.vue';
import SwitchainIcon from 'renderer/components/Icons/SwitchainIcon.vue';
import BackButtonIcon from 'renderer/components/Icons/BackButtonIcon.vue';
import PrivatePublicBalance from "renderer/components/shared/PrivatePublicBalance.vue";
import InputFrame from "renderer/components/shared/InputFrame.vue";
import Dropdown from "renderer/components/shared/Dropdown.vue";

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
    BNBBSC: "Binance Smart Chain",
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
const DEFAULT_PROVIDER = "ChangeNow";

export default {
    name: 'CoinSwapDetail',

    components: {
        Form,
        Field,
        Dropdown,
        Popup,
        InputFrame,
        CoinSwapFlowToFiro,
        CoinSwapFlowFromFiro,
        LoadingBounce,
        SwitchainIcon,
        BackButtonIcon,
        PrivatePublicBalance
    },

    data() {
        return {
            changeAPI: null,
            stealthAPI: null,
            swapzoneAPI: null,
            exolixAPI: null,
            provider: DEFAULT_PROVIDER,
            quotaId: null,
            show:"button",
            ChainOptions,
            CoinNames,
            isPrivate: true,
            isSwapFrom: true,
            marketInfo: {
                _isLoading: true
            },
            // This is used so we can clear an interval created on startup to refresh market info.
            refreshOffersIntervalId: null,
            selectedCoin: '',
            amount: '',
            address: ''
        };
    },

    mounted() {
        this.changeAPI = new ChangeAPIWorker();
        this.stealthAPI = new StealthAPIWorker();
        this.swapzoneAPI = new SwapzoneAPIWorker();
        this.exolixAPI = new ExolixAPIWorker();

        // Refresh market information every 60 seconds.
        this.refreshOffersIntervalId = setInterval(() => {
            this.refreshMarketInfo();
        }, 60e3);
        this.refreshMarketInfo();
    },

    destroyed() {
        clearInterval(this.refreshOffersIntervalId);
    },

    watch: {
        isPrivate() {
            this.cleanupForm(false);
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
            if (!this.isSwapFrom || !this.satoshiAmount) return 0n;
            return this.calculateTransactionFee(this.isPrivate, this.satoshiAmount, this.smartFeePerKb, false);
        },

        formDisabled() {
            return (!this.isBlockchainSynced || (this.isPrivate && !this.isLelantusAllowed));
        },

        validationSchema() {
            [this.selectedCoin, this.marketInfo, this.satoshiAmount, this.provider, this.isSwapFrom];

            return {
                amount: (value) => {
                    if (!this.selectedCoin || !this.isCurrentMarketInfoLoaded || !value)
                        return true;

                    const v = stringToBigint(value);
                    const min = stringToBigint(String(this.currentMarketInfo.min));
                    const max = stringToBigint(String(this.currentMarketInfo.max));
                    if (v < min || v > max)
                        return `Amount must be between ${this.currentMarketInfo.min} and ${this.currentMarketInfo.max}`;

                    if (!this.satoshiAmount)
                        return 'Not a valid amount';

                    if (this.isSwapFrom) {
                        if (this.satoshiAmount > this.available)
                            return `Amount exceeds available balance of ${bigintToString(this.available)} FIRO.`;
                        else if (!this.firoTransactionFee)
                            return `Amount plus fees exceeds available balance of ${bigintToString(this.available)} FIRO.`;
                    }

                    return true;
                },

                address: (value) => {
                    if (!value)
                        return true;

                    let coin;
                    if (['BTC', 'ETH', 'ZEC', 'LTC', 'XRP', 'XLM', 'BNB', 'USDT', 'USDC', 'DASH', 'DCR', 'PAX'].includes(this.selectedCoin))
                        coin = this.selectedCoin;
                    else if (["DAI", "BNBBSC", "USDTBSC", "USDTERC20"].includes(this.selectedCoin))
                        coin = 'ETH';
                    else
                        return 'Unknown coin (this is a bug)';

                    try {
                        return !!CryptoAddressValidator.validate(value, coin, 'prod') || 'Invalid address';
                    } catch(e) {
                        return `${e}`;
                    }
                }
            };
        },

        // This is a bigint representation of the whole-coin amount of the remote currency taken as a transaction fee.
        remoteTransactionFee() {
            return stringToBigint(String(this.currentMarketInfo?.minerFee) || "0");
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

        conversionRate() {
            return stringToBigint(String(this.currentMarketInfo?.rate) || "0");
        },

        satoshiAmount() {
            return stringToBigint(this.amount);
        },

        amountToReceive() {
            if (!this.currentMarketInfo) return;
            if (!this.satoshiAmount) return;
            if (this.isSwapFrom && !this.firoTransactionFee) return;

            if (this.isSwapFrom)
                return ((this.satoshiAmount - this.firoTransactionFee) * this.conversionRate - this.remoteTransactionFee) / 100000000n;
            else
                return (this.satoshiAmount * this.conversionRate - this.remoteTransactionFee) / 100000000n;
        },

        available () {
            return this.isPrivate ? this.availablePrivate : this.availablePublic;
        },

        currentMarketInfo() {
            return this.marketInfo[this.firoPair];
        },

        isCurrentMarketInfoLoaded() {
            return !this.currentMarketInfo?._isLoading;
        }
    },

    methods: {
        bigintToString,
        stringToBigint,

        async refreshMarketInfo() {
            console.debug("Fetching market information...");

            let response;
            let marketInfo;
            if (this.provider === "ChangeNow") {
                try {
                    const mi = await this.changeAPI.getMarketInfo();
                    if (mi.error) throw mi.error;
                    response = mi.response;
                } catch (error) {
                    console.warn(`Error fetching ChangeNow currency info: ${error}`);
                    setTimeout(this.refreshMarketInfo, 10e3);
                    this.marketInfo = { _providerIsUnavailable: true };
                    return;
                }
                console.debug("Got ChangeNow currency information.");

                marketInfo = lodash.fromPairs([
                    ...response
                        .filter(market => AllowedPairs.includes("FIRO-" + market.to.toUpperCase()) && market.from === "firo")
                        .map(market => ["FIRO-" + market.to.toUpperCase(), market]),
                    ...response
                        .filter(market => AllowedPairs.includes(market.from.toUpperCase() + "-FIRO") && market.to === "firo")
                        .map(market => [market.from.toUpperCase() + "-FIRO", market])
                ]);

                if (!Object.keys(marketInfo).length) {
                    console.error("ChangeNow doesn't seem to support FIRO now.");
                    this.marketInfo = { _providerDoesntSupportFiro: true };
                    return;
                }
            } else if (this.provider === "StealthEx") {
                try {
                    response = await this.stealthAPI.getMarketInfo();
                } catch (error) {
                    console.warn(`Error fetching StealthTx currency info: ${error}`);
                    setTimeout(this.refreshMarketInfo, 10e3);
                    this.marketInfo = { _providerIsUnavailable: true };
                    return;
                }
                console.debug("Got Stealth currency information.");

                marketInfo = lodash.fromPairs([
                    ...response
                        .filter(market => AllowedPairs.includes("FIRO-" + market.toUpperCase().replace("-", "")))
                        .map(market => ["FIRO-" + market.toUpperCase().replace("-", ""), market]),
                    ...response
                        .filter(market => AllowedPairs.includes(market.toUpperCase().replace("-", "") + "-FIRO"))
                        .map(market => [market.toUpperCase().replace("-", "") + "-FIRO", market])
                ]);

                if (!Object.keys(marketInfo).length) {
                    console.error("Stealth doesn't seem to support FIRO now.");
                    this.marketInfo = { _providerDoesntSupportFiro: true };
                    return;
                }

            } else if (this.provider === "Swapzone") {
                try {
                    const mi = await this.swapzoneAPI.getMarketInfo();
                    if (mi.error) throw mi.error;
                    response = mi.response;
                } catch (error) {
                    console.warn(`Error fetching Swapzone currency info: ${error}`);
                    setTimeout(this.refreshMarketInfo, 10e3);
                    this.marketInfo = { _providerIsUnavailable: true };
                    return;
                }
                console.debug("Got Stealth currency information.");

                marketInfo = lodash.fromPairs([
                    ...response
                        .filter(market => AllowedPairs.includes(`FIRO-${market.ticker.toUpperCase()}`))
                        .map(market => [`FIRO-${market.ticker.toUpperCase()}`, market]),
                    ...response
                        .filter(market => AllowedPairs.includes(market.ticker.toUpperCase().replace("-", "") + "-FIRO"))
                        .map(market => [`FIRO-${market.ticker.toUpperCase()}`, market])
                ]);

                if (!Object.keys(marketInfo).length) {
                    console.error("Swapzone doesn't seem to support FIRO now.");
                    this.marketInfo = { _providerDoesntSupportFiro: true };
                    return;
                }
            } else if (this.provider === "Exolix") {
                try {
                    const mi = await this.exolixAPI.getMarketInfo();
                    if (mi.error) throw mi.error;
                    response = mi.response;
                } catch (error) {
                    console.warn(`Error fetching Exolix currency info: ${error}`);
                    setTimeout(this.refreshMarketInfo, 10e3);
                    this.marketInfo = {_providerIsUnavailable: true};
                    return;
                }
                console.debug("Got Exolix currency information.");

                marketInfo = lodash.fromPairs([
                    ...response.filter(market => AllowedPairs.includes("FIRO-" + market.code))
                        .map(market => ["FIRO-" + market.code, market]),
                    ...response.filter(market => AllowedPairs.includes(market.code + "-FIRO"))
                        .map(market => [market.code + "-FIRO", market])
                ]);

                if (!Object.keys(marketInfo).length) {
                    console.error("Exolix doesn't seem to support FIRO now.");
                    this.marketInfo = { _providerDoesntSupportFiro: true };
                    return;
                }
            } else {
                console.error(`Unknown provider: ${this.provider}`);
            }

            this.marketInfo = marketInfo;
        },

        cleanupForm(enablePrivate=true) {
            if (enablePrivate) this.isPrivate = true;
            this.amount = '';
            this.address = ''
            this.error = null;
            this.provider = DEFAULT_PROVIDER;
            this.selectedCoin = '';
        }
    }
};
</script>

<style lang="scss" scoped>
.coin-swap-detail {
    padding: var(--padding-base);
    height: 100%;
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
