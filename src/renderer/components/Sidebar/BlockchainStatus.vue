<template>
    <div id="blockchain-status">
        <div v-if="connections === 0 && !['regtest', 'regtest-ql'].includes(network)" class="connecting">
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
                {{currentBlockHeight}} ({{ latestBlockRelativeDate }}),
                {{connections}} connections
            </div>
        </div>
    </div>
</template>

<script>
import {mapGetters} from "vuex";
import LoadingBounce from "../Icons/LoadingBounce.vue";
import {ago} from "time-ago";

export default {
    name: "BlockchainStatus",

    components: {
        LoadingBounce
    },

    data() {
        return {
            tick: 0,
            timer: null
        };
    },

    mounted() {
        this.timer = setInterval(() => this.tick++, 30e3);
    },

    unmounted() {
        clearInterval(this.timer);
    },

    computed: {
        ...mapGetters({
            network: 'ApiStatus/network',
            connections: 'ApiStatus/connections',
            currentBlockHeight_: 'ApiStatus/currentBlockHeight',
            isBlockchainSynced: 'ApiStatus/isBlockchainSynced',
            latestBlockTimestamp: 'ApiStatus/latestBlockTimestamp'
        }),

        currentBlockHeight() {
            const segments = [];
            let x = this.currentBlockHeight_;
            while (x > 0) {
                segments.push((1000 + x % 1000).toString().slice(1));
                x = Math.floor(x / 1000);
            }
            return segments.reverse().join(',');
        },

        latestBlockRelativeDate() {
            this.tick;
            return ago(this.latestBlockTimestamp * 1000)
        }
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