<template>
    <section class="coin-swap-detail detail">
        <div class="inner">
            <div class="top">
                <div class="chain-icon" @click="chainSelect">
                    {{ chainName }}
                </div>
                <div class="field checkbox-field">
                    <input type="radio" v-model="isSwapFrom" :value="true" />
                    <label>Swap from FIRO</label>
                </div>

                <div class="field checkbox-field">
                    <input type="radio" v-model="isSwapFrom" :value="false">
                    <label>Swap to FIRO</label>
                </div>

                <div class="field pseudo-input-frame">
                    <label>{{ isSwapFrom ? 'Receive' : 'Send' }}</label>
                    <!-- The use of option.coin below is a function of vue-select, wherein option[label] is set to the
                         selected value rather than option itself. -->
                    <vue-select
                        class="select"
                        label="coin"
                        v-model="selectedCoin"
                        :loading="!isSwitchainUnavailable && !doesSwitchainNotSupportFiro && !isMarketInfoLoaded"
                        :disabled="isSwitchainUnavailable || doesSwitchainNotSupportFiro || !isMarketInfoLoaded"
                        :options="remoteCoins"
                        :placeholder="(isSwitchainUnavailable && 'The chain is unavailable') || (!isMarketInfoLoaded && 'Loading coins...') || (doesSwitchainNotSupportFiro && 'Firo swaps are unavailable') || 'Select coin'"
                    >
                        <template v-slot:option="option">
                            <div class="coin-option">
                                <CoinIcon :coin="option.coin.toUpperCase()" :width="20" :height="20" />
                                <div class="coin-short-name">{{ option.coin }}</div>
                                <div class="coin-name">{{ CoinNames[option.coin.toUpperCase()] }}</div>
                            </div>
                        </template>

                        <template v-slot:selected-option="option">
                            <div class="coin-option" v-if="option">
                                <CoinIcon :coin="option.coin.toUpperCase()" :width="20" :height="20" />
                                <div class="coin-short-name">{{ option.coin }}</div>
                                <div class="coin-name">{{ CoinNames[option.coin.toUpperCase()] }}</div>
                            </div>
                        </template>
                    </vue-select>
                </div>

                <InputFrame label="Amount" :unit="isSwapFrom ? 'FIRO' : selectedCoin">
                    <input
                        id="amount"
                        ref="amount"
                        v-model="amount"
                        v-validate="amountValidations"
                        v-tooltip="getValidationTooltip('amount')"
                        type="text"
                        :disabled="formDisabled || !selectedCoin"
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

                    <div v-if="isSwapFrom && !isBigWallet" class="total-field">
                        <label>Firo Transaction fee:</label>

                        <div class="value">
                            <div v-if="firoTransactionFee">
                                <span class="amount">{{ convertToCoin(firoTransactionFee) }}</span>
                                <span class="ticker">FIRO</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="selectedCoin" class="total-field">
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
                <div v-if="firoTransactionFeeError" class="error">
                    {{ firoTransactionFeeError }}
                </div>

                <CoinSwapFlowFromFiro
                    v-if="isSwapFrom"
                    :disabled="formDisabled || !canBeginSwapFromFiro"
                    :is-private="isPrivate"
                    :remote-currency="selectedCoin"
                    :is-big-wallet="isBigWallet"
                    :firo-transaction-fee="firoTransactionFee"
                    :tx-fee-per-kb="smartFeePerKb"
                    :remote-transaction-fee="remoteTransactionFee"
                    :firo-amount="satoshiAmount"
                    :remote-amount="amountToReceive"
                    :receive-address="address"
                    :expected-rate="conversionRate"
                    :class="{disabled: formDisabled}"
                    @reset="cleanupForm"
                    @success="cleanupForm"
                />

                <CoinSwapFlowToFiro
                    v-else
                    :disabled="formDisabled || !canBeginSwapToFiro"
                    :remote-currency="selectedCoin"
                    :remote-amount="amount"
                    :firo-amount="amountToReceive"
                    :firo-transaction-fee="remoteTransactionFee"
                    :refund-address="address"
                    :expected-rate="conversionRate"
                    @reset="cleanupForm"
                    @success="cleanupForm"
                />

                <div class="footer">
                    <PrivatePublicBalance v-model="isPrivate" :disabled="!isSwapFrom || !this.isBlockchainSynced" />
                </div>
            </div>
        </div>
        <Popup v-if="show !== 'button'" :margin="show !== 'wait'">
            <CoinSwapChain
                ref="modalRef"
                v-if="show === 'info'"
                :selected-chain="chainName"
                :chain-options="ChainOptions"
                :show-cancel="true"
                @cancel="cancel()"
                @confirm="changeChain()" 
            />
            <WaitOverlay v-if="show === 'wait'" />
        </Popup>
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
import { convertToSatoshi, convertToCoin } from 'lib/convert';
import { VueSelect } from 'vue-select';
import APIWorker from 'lib/switchain-api';
import ChangeAPIWorker from 'lib/changenow-api';
import StealthAPIWorker from 'lib/stealth-api';
import LoadingBounce from 'renderer/components/Icons/LoadingBounce';
import CircularTimer from 'renderer/components/Icons/CircularTimer';
import CoinIcon from './CoinIcon';
import SwitchainIcon from 'renderer/components/Icons/SwitchainIcon';
import BackButtonIcon from 'renderer/components/Icons/BackButtonIcon';
import PrivatePublicBalance from "renderer/components/shared/PrivatePublicBalance";
import {FirodErrorResponse} from "daemon/firod";
import InputFrame from "renderer/components/shared/InputFrame";

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
    USDC: "USD Coin",
    DAI: "Dai",
    DASH: "Dash",
    DCR: "Decred",
    PAX: "Paxos Standard",
    KMD: "Komodo",
    BCH: "BitcoinCash"
};

const ChainOptions = [
    {chain: "ChangeNow"},
    {chain: "StealthEx"},
];

const AddressValidations = {};
for (const coin of ['BTC', 'ETH', 'ZEC', 'LTC', 'XRP', 'XLM', 'BNB', 'BNBBSC','USDT', 'USDC', 'DASH', 'DCR', 'PAX', 'KMD', 'BCH']) {
    AddressValidations[coin] = (address) => {
        try {
            if (coin == "BNBBSC") coin = 'ETH';
            return CryptoAddressValidator.validate(address, coin);
        } catch {
            // This case should never occur unless the library is updated to remove functionality or such, but it's
            // extremely important to catch errors so we'll check for it anyway.
            console.error(`No validator exists for ${coin}`);
            return false;
        }
    }
}

AddressValidations.DAI = (address) => CryptoAddressValidator.validate(address, 'ETH');

export default {
    name: 'CoinSwapDetail',

    components: {
        Popup,
        CoinSwapChain,
        InputFrame,
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
            chainName: "ChangeNow",
            show:"button",
            ChainOptions,
            CoinNames,
            isPrivate: true,
            isSwapFrom: true,
            // This prevents the display of inaccurate transaction fees.
            calculatingFiroTransactionFee: false,
            // This is used to update market info when necessary.
            marketInfoRefreshNonce: 0,
            // This is used so we can clear an interval created on startup to refresh market info.
            refreshOffersIntervalId: null,
            feeMap: {},
            selectedCoin: null,
            amount: '',
            address: ''
        };
    },

    beforeMount () {
        // Set up VeeValidator rules.

        this.$validator.extend('amountIsWithinAvailableBalance', {
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
    },

    created() {
        //Refresh market information every 30 seconds.
        this.refreshOffersIntervalId = setInterval(() => {
            this.marketInfoRefreshNonce++;
        }, 60e3);
    },

    destroyed() {
        clearInterval(this.refreshOffersIntervalId);
    },

    watch: {
        // Returns [number (txfee in satoshi), error (string)], one of which will be null.
        async currentTxFeeId() {
            // It takes too long to calculate transaction fees on big wallets, so we just don't display them to the user.
            if (this.isBigWallet) return;

            if (!this.currentTxFeeId) return;
            if (this.feeMap[this.currentTxFeeId]) return;

            // Only calculate the fee once the user has stopped typing for 300ms.
            const txFeeId = this.currentTxFeeId;
            await new Promise(r => setTimeout(r, 300));
            if (this.currentTxFeeId !== txFeeId) return;

            let fee;
            try {
                if (this.isPrivate) {
                    fee = [await $daemon.calcLelantusTxFee(this.satoshiAmount, this.smartFeePerKb, false), null];
                } else {
                    fee = [await $daemon.calcPublicTxFee(this.satoshiAmount, false, this.smartFeePerKb), null];
                }

                if (this.satoshiAmount + fee[0] > this.available) {
                    fee = [null, 'Insufficient funds'];
                }
            } catch (e) {
                if (e instanceof FirodErrorResponse) {
                    fee = [null, e.errorMessage];
                } else {
                    fee = [null, `${e}`];
                }
            }

            this.$set(this.feeMap, txFeeId, fee);
        },

        marketInfo() {
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

        isPrivate() {
            this.cleanupForm(false);
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
                let marketInfo = [];
                let temp;
                if (this.chainName === "ChangeNow") {
                    try {
                        const api = new ChangeAPIWorker();
                        const mi = await api.getMarketInfo();
                        if (mi.error) throw mi.error;
                        response = mi.response;                        
                    } catch (error) {
                        console.warn(`Error fetching ChangeNow currency info: ${error}`);
                        setTimeout(() => this.marketInfoRefreshNonce++, 10e3);
                        return {_switchainIsUnavailable: true};
                    }
                    this.$log.silly("Got ChangeNow currency information.");
                    
                    marketInfo = lodash.fromPairs(
                        response.filter(market => AllowedPairs.includes("FIRO-"+market.to.toUpperCase()) && market.from === "firo")
                            .map(market => ["FIRO-"+market.to.toUpperCase(), market]).concat(
                        response.filter(market => AllowedPairs.includes(market.from.toUpperCase()+"-FIRO") && market.to === "firo")
                            .map(market => [market.from.toUpperCase()+"-FIRO", market]))
                    );
                    
                    if (!Object.keys(marketInfo).length) {
                        this.$log.error("ChangeNow doesn't seem to support FIRO now. :(");
                        return {_switchainDoesntSupportFiro: true};
                    }

                } else {
                    try {
                        const stealth = new StealthAPIWorker();
                        response = await stealth.getAvailableCurrency();
                    } catch (error) {
                        console.warn(`Error fetching StealthTx currency info: ${error}`);
                        setTimeout(() => this.marketInfoRefreshNonce++, 10e3);
                        return {_switchainIsUnavailable: true};
                    }
                    this.$log.silly("Got Stealth currency information.");

                    response.forEach(element => {
                        if (AllowedPairs.includes(element.toUpperCase())){
                            temp={'coin':element};
                            marketInfo.push(temp);
                        }
                    });
                    
                    if (!Object.keys(marketInfo).length) {
                        this.$log.error("Stealth doesn't seem to support FIRO now. :(");
                        return {_switchainDoesntSupportFiro: true};
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
            isBigWallet: 'Transactions/isBigWallet',
            smartFeePerKb: 'ApiStatus/smartFeePerKb'
        }),

        firoTransactionFeeAndError() {
            return this.isSwapFrom ? this.feeMap[this.currentTxFeeId] : null;
        },

        currentTxFeeId() {
            if (!this.satoshiAmount) return;
            if (this.useCustomFee && this.getValidationTooltip('txFeePerKb').content) return;
            if (this.getValidationTooltip('amount').content) return;

            return [
                this.satoshiAmount,
                this.txFeePerKb,
                this.coinControl,
                this.subtractFeeFromAmount,
                this.isPrivate
            ]
                .map(String)
                .join("\n");
        },

        firoTransactionFee() {
            return this.firoTransactionFeeAndError && this.firoTransactionFeeAndError[0];
        },

        firoTransactionFeeError() {
            return this.firoTransactionFeeAndError && this.firoTransactionFeeAndError[1];
        },

        formDisabled() {
            //return this.isSwapFrom && (!this.isBlockchainSynced || (this.isPrivate && !this.isLelantusAllowed));
            return (!this.isBlockchainSynced || (this.isPrivate && !this.isLelantusAllowed));
        },

        amountValidations () {
            if (!this.selectedCoin) {
                return '';
            } else if (this.isSwapFrom) {
                if (this.isPrivate) {
                    return `${this.xzcPair}AmountDoesntViolateAPILimits|amountIsWithinAvailableBalance|privateAmountDoesntViolateSpendLimit`;
                } else {
                    return `${this.xzcPair}AmountDoesntViolateAPILimits|amountIsWithinAvailableBalance`;
                }
            } else {
                return `${this.xzcPair}AmountDoesntViolateAPILimits`;
            }
        },

        // The information about the currently selected market, or undefined if marketInfo isn't loaded or no coin is
        // selected.
        // Returns:
        // {
        //     from: string,     // CUR1 eg. USDT
        //     to: string,     // CUR2 eg. FIRO
        //     rate: string,    // the string-encoded rational number of currency CUR1 equal to CUR2, eg. "3.1415"
        //     minerFee: number, // the satoshi amount miner fee
        //     min: number, // the minimum amount of CUR1 that must be sent
        //     max: number, // the maximum amount of CUR1 that must be sent
        // }
        currentMarketInfo() {
            return this.marketInfo[this.xzcPair];
        },

        // This is a string representation of the whole-coin amount of the remote currency taken as a transaction fee.
        remoteTransactionFee() {
            return String(this.currentMarketInfo && this.currentMarketInfo.minerFee);
        },

        isMarketInfoLoaded() {
            return !this.marketInfo._isLoading;
        },

        isSwitchainUnavailable() {
            return this.marketInfo._switchainIsUnavailable;
        },

        doesSwitchainNotSupportFiro() {
            return this.marketInfo._switchainDoesntSupportFiro;
        },

        coinsFromFiro() {
            return Object.keys(this.marketInfo)
                .filter(pair => pair.match(/^FIRO-/))
                .map(pair => pair.split('-')[1])
                .sort();
        },

        coinsToFiro() {
            return Object.keys(this.marketInfo)
                .filter(pair => pair.match(/-FIRO$/))
                .map(pair => pair.split('-')[0])
                .sort();
        },

        remoteCoins() {
            return this.isSwapFrom ? this.coinsFromFiro : this.coinsToFiro;            
            //return this.marketInfo;
        },

        xzcPair() {
            return this.isSwapFrom ? `FIRO-${this.selectedCoin}` : `${this.selectedCoin}-FIRO`;
        },

        // We return a decimal-formatted string (or undefined).
        conversionRate() {
            return this.currentMarketInfo && String(this.currentMarketInfo.rate);
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
                if (!this.isBigWallet && !this.firoTransactionFee) return;

                const conversionRate = new Big(this.conversionRate);
                const firoAmount = new Big(this.satoshiAmount) / 1e8;
                const firoTxFee = this.isBigWallet ? 0 : new Big(this.firoTransactionFee) / 1e8;
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
            return (this.isBigWallet || (!this.calculatingFiroTransactionFee && this.firoTransactionFee)) && this.selectedCoin && this.amount && this.address && !this.validationErrors.items.length;
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

        cleanupForm(enablePrivate=true) {
            if (enablePrivate) this.isPrivate = true;
            this.selectedCoin = null;
            this.amount = '';
            this.address = ''
            this.error = null;
        },

        chainSelect() {
            this.show = 'info';
        }, 

        changeChain() {
            let temp = this.$refs['modalRef'].selectedValue;
            this.show = 'button';
            this.chainName = temp.chain;
        },

        cancel() {
            this.show = 'button';
        },
    }
};
</script>

<style lang="scss">
.v-select {
    .dropdown-toggle {
        color: var(--color-text-primary) !important;
        background-color: inherit !important;

        input {
            background-color: inherit !important;
        }
    }

    button.clear {
        color: var(--color-text-primary) !important;
    }

    i {
        background-color: inherit !important;

        &::before {
            border-color: var(--color-text-primary) !important;
        }
    }

    .selected-tag {
        color: inherit !important;
    }

    .dropdown-menu {
        //background: var(--color-background-tag) !important;
        background: var(--color-background-sidebar) !important;
        li {
            background-color: inherit !important;
        }

        a {
            color: var(--color-text-primary) !important;
        }
    }
}
</style>

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

            .chain-icon {
                position: fixed;
                right: var(--padding-base);
                filter: brightness(2.0);
            }

            // :first-child is .switchain-icon
            .field:not(:nth-child(2)) {
                margin-top: var(--padding-base);
            }

            .pseudo-input-frame {
                position: relative;
                height: 50px;

                label {
                    position: absolute;
                    left: 9px;
                    font-size: 12px;
                    letter-spacing: 0.4px;
                    background-color: var(--color-background-sidebar);
                    z-index: var(--z-input-frame-label);
                    padding: {
                        left: 5px;
                        right: 5px;
                    }
                }

                .v-select {
                    position: absolute;
                    top: 6px;
                    bottom: 0;
                    right: 0;
                    left: 0;

                    height: 36px;

                    .dropdown-toggle {
                        font-weight: bold;
                        height: 100%;
                        width: 100%;
                        padding: {
                            top: 11px;
                            bottom: 11px;
                            left: 14px;
                            right: 14px;
                        }
                        background-color: inherit;
                        border: none;
                        outline: none;
                    }

                    .coin-option {
                        display: flex;
                        align-items: center;

                        .coin-short-name {
                            border: {
                                width: 1px;
                                style: solid;
                                color: var(--color-text-subtle-border);
                                radius: 5px;
                            }
                            padding: {
                                top: 2px;
                                bottom: 2px;
                                left: 2px;
                                right: 2px;
                            }
                            margin-left: 8px;
                        }

                        .coin-name {
                            padding-left: 8px;
                        }
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
