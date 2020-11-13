<template>
    <div id="send-page">
        <div id="send-primary">
            <CoinSwapList />
        </div>

        <CoinSwapDetail />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CoinSwapList from 'renderer/components/CoinSwapPage/CoinSwapList';
import CoinSwapDetail from 'renderer/components/CoinSwapPage/CoinSwapDetail';

export default {
    name: 'CoinSwapPage',
    components: {
        CoinSwapDetail,
        CoinSwapList,
    },
};
</script>

<style lang="scss">
@import 'src/renderer/styles/colors';
@import 'src/renderer/styles/sizes';
#send-page {
    height: 100%;
    #send-primary {
        height: 100%;
        width: $size-primary-content-width;
        float: left;
    }
}
</style>
