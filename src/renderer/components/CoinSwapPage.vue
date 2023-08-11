<template>
    <div class="coin-swap-page">
        <CoinSwapList class="coin-swap-primary" />
        <CoinSwapDetail class="coin-swap-detail" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CoinSwapList from 'renderer/components/CoinSwapPage/CoinSwapList.vue';
import CoinSwapDetail from 'renderer/components/CoinSwapPage/CoinSwapDetail.vue';

export default {
    name: 'CoinSwapPage',
    components: {
        CoinSwapDetail,
        CoinSwapList,
    },
};
</script>

<style lang="scss" scoped>
.coin-swap-page {
    display: flex;
    height: 100%;

    .coin-swap-primary {
        flex-grow: 1;
    }

    .coin-swap-detail {
        width: var(--width-detail);
    }
}
</style>
