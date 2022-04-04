<template>
    <svg :width="width" :height="height" v-if="coin === 'BTC'"><BTCIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'ETH'"><ETHIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'ZEC'"><ZECIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'LTC'"><LTCIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'XRP'"><XRPIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'XLM'"><XLMIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'BCHABC'"><BCHABCIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'BNB'|| coin === 'BNBBSC'"><BNBIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'USDT'|| coin ==='USDTBSC'"><USDTIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'USDC'"><USDCIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'DAI'"><DAIIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'DASH'"><DASHIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'DCR'"><DCRIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'PAX'"><PAXIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'TUSD'"><TUSDIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'KMD'"><KMDIcon /></svg>
    <svg :width="width" :height="height" v-else-if="coin === 'BCH'"><BCHIcon /></svg>
</template>

<script>
import BTCIcon from 'renderer/components/Icons/BTCIcon';
import ETHIcon from 'renderer/components/Icons/ETHIcon';
import ZECIcon from 'renderer/components/Icons/ZECIcon';
import LTCIcon from 'renderer/components/Icons/LTCIcon';
import XRPIcon from 'renderer/components/Icons/XRPIcon';
import XLMIcon from 'renderer/components/Icons/XLMIcon';
import BCHABCIcon from 'renderer/components/Icons/BCHABCIcon';
import BNBIcon from 'renderer/components/Icons/BNBIcon';
import USDTIcon from 'renderer/components/Icons/USDTIcon';
import USDCIcon from 'renderer/components/Icons/USDCIcon';
import DAIIcon from 'renderer/components/Icons/DAIIcon';
import DASHIcon from 'renderer/components/Icons/DASHIcon';
import DCRIcon from 'renderer/components/Icons/DCRIcon';
import PAXIcon from 'renderer/components/Icons/PAXIcon';
import TUSDIcon from 'renderer/components/Icons/TUSDIcon';
import KMDIcon from 'renderer/components/Icons/KMDIcon';
import BCHIcon from 'renderer/components/Icons/BCHIcon';

export default {
    name: 'CoinIcon',

    components: {
        BTCIcon,
        ETHIcon,
        ZECIcon,
        LTCIcon,
        XRPIcon,
        XLMIcon,
        BCHABCIcon,
        BNBIcon,
        USDTIcon,
        USDCIcon,
        DAIIcon,
        DASHIcon,
        DCRIcon,
        PAXIcon,
        TUSDIcon,
        KMDIcon,
        BCHIcon
    },

    props: {
        coin: {
            type: String,
            default: ''
        },
        width: {
            type: Number,
            default: 25
        },
        height: {
            type: Number,
            default: 25
        }
    }
};
</script>
