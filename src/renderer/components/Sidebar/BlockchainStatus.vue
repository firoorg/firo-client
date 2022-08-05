<template>
    <div id="blockchain-status">
        <div v-if="connections === 0 && network !== 'regtest'" class="connecting">
            <loading-bounce size="mini" />
            Connecting...
        </div>
        <div v-else-if="isBlockchainSynced">
            <div class="details">
                {{currentBlockHeight}} blocks, {{connections}} connections
            </div>
        </div>

        <div v-else>
            <div class="syncing-text">
                <loading-bounce size="mini" />
                Syncing...
            </div>

            <div class="details">
                {{currentBlockHeight}} (<timeago :datetime="latestBlockTimestamp * 1000" />),
                {{connections}} connections
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
            connections: 'ApiStatus/connections',
            currentBlockHeight: 'ApiStatus/currentBlockHeight',
            isBlockchainSynced: 'ApiStatus/isBlockchainSynced',
            latestBlockTimestamp: 'ApiStatus/latestBlockTimestamp'
        })
    }
}
</script>

<style scoped lang="scss">
#blockchain-status {
    font: {
        style: italic;
        size: 0.8em;
    }

    // This is the loading bounce.
    .spinner {
        margin-right: 6px;
    }

    .connecting, .syncing-text {
        margin-bottom: 6px;
        * {
            display: inline-block;
        }
    }
}
</style>