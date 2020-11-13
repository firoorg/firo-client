<template>
    <div id="blockchain-status">
        <div v-if="connections === 0 && network !== 'regtest'" class="connecting">
            <loading-bounce size="mini" />
            Connecting...
        </div>
        <div v-else-if="!isBlockchainSynced">
            <div class="syncing-text">
                <loading-bounce size="mini" />
                Syncing...
            </div>

            <div class="details">
                {{currentBlockHeight}}/~{{estimatedBlockHeight}} blocks, {{connections}} connections
            </div>
        </div>
    </div>
</template>

<script>
import {mapGetters} from "vuex";
import LoadingBounce from "../Icons/LoadingBounce";

export default {
    name: "BlockchainStatus",

    components: {
        LoadingBounce
    },

    computed: {
        ...mapGetters({
            network: 'ApiStatus/network',
            connections: 'Blockchain/connections',
            currentBlockHeight: 'Blockchain/currentBlockHeight',
            estimatedBlockHeight: 'Blockchain/estimatedBlockHeight',
            isBlockchainSynced: 'Blockchain/isBlockchainSynced',
        })
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/typography";


#blockchain-status {
    @include small();
    font-style: italic;
    margin: {
        bottom: $size-tiny-space;
        left: $size-tiny-space;
    }

    // This is the loading bounce.
    .spinner {
        margin-right: $size-tiny-space;
    }

    .connecting, .syncing-text {
        margin-bottom: $size-tiny-space;
        * {
            display: inline-block;
        }
    }
}
</style>