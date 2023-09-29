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
                    :disabled="formDisabled"
                    :label-text="isSwapFrom ? 'Receive' : 'Send'"
                    empty-text="Select Coin"
                    :options="remoteCoins"
                    v-model="selectedCoin"
                />

                <InputFrame label="Amount" :unit="isSwapFrom ? 'FIRO' : selectedCoin">
                    <Field
                        id="amount"
                        ref="amount"
                        v-model="strAmount"
                        v-tooltip="errors.amount"
                        type="text"
                        :disabled="formDisabled"
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
                        :disabled="formDisabled"
                        spellcheck="false"
                        :validate-on-input='true'
                    />
                </InputFrame>

                <div v-if="marketError" class="market-error">
                    {{ marketError }}
                </div>

                <div v-else-if="currentMarketInfo" class="totals">
                    <div class="total-field">
                        <label>Rate:</label>

                        <div v-if="currentMarketInfo" class="value">
                            <Amount :amount="BigInt(1e8)" :ticker="isSwapFrom ? 'FIRO' : selectedCoin" />
                            =
                            <Amount :amount='currentMarketInfo.rate' :ticker="!isSwapFrom ? 'FIRO' : selectedCoin" />
                        </div>
                    </div>

                    <div v-if="isSwapFrom" class="total-field">
                        <label>Firo Transaction fee:</label>

                        <div class="value">
                            <Amount v-if='firoTxFee' :amount="firoTxFee" ticker="FIRO" />
                        </div>
                    </div>

                    <div v-if="currentMarketInfo" class="total-field">
                        <label>{{ isSwapFrom ? CoinNames[selectedCoin] : 'FIRO' }} Transaction Fee:</label>

                        <div class="value">
                            <Amount :amount="currentMarketInfo.fee" :ticker="isSwapFrom ? selectedCoin : 'FIRO'" />
                        </div>
                    </div>

                    <div class="total-field" id="total-amount">
                        <label>You will receive:</label>

                        <div v-if="amountToReceive" class="value">
                            ~
                            <Amount :amount="amountToReceive" :ticker="isSwapFrom ? selectedCoin : 'FIRO'" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="bottom">
                <CoinSwapFlowFromFiro
                    v-if="isSwapFrom"
                    :disabled='!formIsValid'
                    :is-private="isPrivate"
                    :pair-info="currentMarketInfo"
                    :destination-address="address"
                    :tx-fee-per-kb="smartFeePerKb"
                    :firo-tx-fee="firoTxFee"
                    :send-amount="amount"
                    @reset="cleanupForm"
                    @success="cleanupForm"
                />

                <CoinSwapFlowToFiro
                    v-else
                    :disabled='!formIsValid'
                    :pair-info="currentMarketInfo"
                    :refund-address="address"
                    :send-amount="amount"
                    @reset='cleanupForm'
                    @success='cleanupForm'
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
import Amount from 'renderer/components/shared/Amount.vue';
import Popup from 'renderer/components/shared/Popup';
import CryptoAddressValidator from '@swyftx/api-crypto-address-validator';
import { mapGetters } from 'vuex';
import CoinSwapFlowFromFiro from 'renderer/components/CoinSwapPage/CoinSwapFlowFromFiro.vue';
import CoinSwapFlowToFiro from "renderer/components/CoinSwapPage/CoinSwapFlowToFiro.vue";
import { bigintToString, stringToBigint } from 'lib/convert';
import LoadingBounce from 'renderer/components/Icons/LoadingBounce.vue';
import SwitchainIcon from 'renderer/components/Icons/SwitchainIcon.vue';
import BackButtonIcon from 'renderer/components/Icons/BackButtonIcon.vue';
import PrivatePublicBalance from "renderer/components/shared/PrivatePublicBalance.vue";
import InputFrame from "renderer/components/shared/InputFrame.vue";
import Dropdown from "renderer/components/shared/Dropdown.vue";
import ApiKeys from "keys";
import {CoinSwapApiWrapper, PROVIDERS} from 'lib/coinswap';

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

const ChainOptions = PROVIDERS.map(p => ({id: p, name: p}));
const DEFAULT_PROVIDER = PROVIDERS[0];

export default {
    name: 'CoinSwapDetail',

    components: {
        Amount,
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
            coinSwapApi: null,
            provider: DEFAULT_PROVIDER,
            providerPairs: {},
            quotaId: null,
            ChainOptions,
            CoinNames,
            isPrivate: true,
            isSwapFrom: true,
            selectedCoin: '',
            strAmount: '',
            address: '',
            formIsValid: false,
            currentMarketInfo: null,
            availablePairs: [],
            marketError: null
        };
    },

    mounted() {
        this.coinSwapApi = new CoinSwapApiWrapper(ApiKeys);
        this.refreshMarketInfo();
    },

    watch: {
        isSwapFrom() {
            this.refreshMarketInfo().then(() => this.validateForm());
        },

        provider() {
            this.refreshMarketInfo().then(() => this.validateForm());
        },

        selectedCoin() {
            this.refreshMarketInfo().then(() => this.validateForm());
        },

        amount() {
            this.refreshMarketInfo().then(() => this.validateForm());
        },

        address() {
            this.validateForm();
        },

        isPrivate() {
            this.validateForm();
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
            smartFeePerKb: 'ApiStatus/smartFeePerKb',
            isSparkAllowed: 'ApiStatus/isSparkAllowed'
        }),

        firoTxFee() {
            if (!this.isSwapFrom || !this.amount) return 0n;
            return this.calculateTransactionFee(this.isPrivate ? (this.isSparkAllowed ? 'spark' : 'lelantus') : 'public', this.amount, this.smartFeePerKb, false);
        },

        amount() {
            return stringToBigint(this.strAmount)
        },

        available() {
            return this.isPrivate ? this.availablePrivate : this.availablePublic;
        },

        formDisabled() {
            return !this.isBlockchainSynced || (this.isPrivate && !this.isLelantusAllowed);
        },

        validationSchema() {
            [this.selectedCoin, this.currentMarketInfo, this.amount, this.provider, this.isSwapFrom];

            return {
                amount: (value) => {
                    const c = this.currentMarketInfo;

                    if (!this.selectedCoin || !c || !value)
                        return true;

                    if ((c.min && this.amount < c.min) || (c.max && this.amount > c.max)) {
                        return `Amount must be between ${bigintToString(c.min) || 0} and ${bigintToString(c.max) || 'infinity'}`;
                    }

                    if (this.isSwapFrom) {
                        if (this.amount > this.available)
                            return `Amount exceeds available balance of ${bigintToString(this.available)} FIRO.`;
                        else if (!this.firoTxFee)
                            return `Amount plus fees exceeds available balance of ${bigintToString(this.available)} FIRO.`;
                    }

                    return true;
                },

                address: (value) => {
                    if (!value)
                        return true;

                    let coin;
                    if (["DAI", "BNBBSC", "USDTBSC", "USDTERC20"].includes(this.selectedCoin))
                        coin = 'ETH';
                    else if (CoinNames[this.selectedCoin])
                        coin = this.selectedCoin;
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

        coinsFromFiro() {
            return this.availablePairs
                .filter(([from, to]) => from == 'FIRO' && CoinNames[to])
                .map(([_from, to]) => to)
                .sort();
        },

        coinsToFiro() {
            return this.availablePairs
                .filter(([from, to]) => CoinNames[from] && to == 'FIRO')
                .map(([from, _to]) => from)
                .sort();
        },

        remoteCoins() {
            return (this.isSwapFrom ? this.coinsFromFiro : this.coinsToFiro).map(coin => ({
                id: coin,
                icon: CoinIcons[coin],
                name: CoinNames[coin]
            }));
        },

        amountToReceive() {
            if (!this.currentMarketInfo) return;
            if (this.isSwapFrom && !this.firoTxFee) return;
            if (!this.amount) return;

            return ((this.amount * this.currentMarketInfo.rate) / 10n ** 8n) - this.currentMarketInfo.fee;
        }
    },

    methods: {
        bigintToString,

        async refreshMarketInfo() {
            if (
                this.currentMarketInfo?.provider == this.provider &&
                this.currentMarketInfo?.from == (this.isSwapFrom ? 'FIRO' : this.selectedCoin) &&
                this.currentMarketInfo?.to == (this.isSwapFrom ? this.selectedCoin : 'FIRO') &&
                (!this.currentMarketInfo?.min || this.amount > this.currentMarketInfo?.min) &&
                (!this.currentMarketInfo?.max || this.amount < this.currentMarketInfo?.max)
            ) {
                return;
            } else {
                this.marketError = null;
                this.currentMarketInfo = null;
                this.availablePairs = [];
            }

            try {
                if (!this.providerPairs[this.provider]) {
                    console.debug(`Fetching available pairs from ${this.provider}...`);
                    this.providerPairs[this.provider] = await this.coinSwapApi.getPairs(this.provider);
                }
                this.availablePairs = this.providerPairs[this.provider];

                if (!this.availablePairs.find(([from, to]) => from == 'FIRO' || to == 'FIRO')) {
                    this.marketError = `${this.provider} does not support FIRO`;
                    return;
                }

                if (this.selectedCoin) {
                    console.debug(`Fetching market info for ${this.isSwapFrom ? `FIRO -> ${this.selectedCoin}` : `${this.selectedCoin} -> FIRO`}...`);

                    if (this.isSwapFrom)
                        this.currentMarketInfo = await this.coinSwapApi.getPairInfo(this.provider, 'FIRO', this.selectedCoin, this.amount);
                    else
                        this.currentMarketInfo = await this.coinSwapApi.getPairInfo(this.provider, this.selectedCoin, 'FIRO', this.amount);
                } else {
                    this.currentMarketInfo = null;
                }

                this.marketError = null;
            } catch (e) {
                this.marketError = e?.message || `${e}`;
                console.error(`Error fetching market info: ${this.marketError}`);
            }
        },

        async validateForm() {
            this.formIsValid = false;
            this.formIsValid = (await this.$refs.form.validate()).valid;
        },

        cleanupForm(enablePrivate=true) {
            if (enablePrivate) this.isPrivate = true;
            this.strAmount = '';
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

            .market-error {
                font-weight: bold;
                text-align: center;
                color: var(--color-status-error);
            }
        }
    }
}
</style>
