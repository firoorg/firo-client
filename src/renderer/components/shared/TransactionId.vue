<template>
    <div>
        <div class="txid">{{ txid }}</div>
        <a v-if="showOpenInBlockExplorer" href="#" @click="openInBlockExplorer">
            open in block explorer
        </a>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';
import {shell} from 'electron';

export default {
    name: "TransactionId",

    props: {
        txid: {
            type: String,
            required: true
        },
    },

    computed: {
        ...mapGetters({
            network: 'ApiStatus/network'
        }),

        showOpenInBlockExplorer() {
            return this.network !== 'regtest';
        }
    },

    methods: {
        openInBlockExplorer() {
            if (confirm("This link will take you to an external block explorer. Explorers may log your IP addresses " +
                        "and tie them to the transaction ID you are looking up. Continue anyway?")) {
                if (this.network === 'main') {
                    shell.openExternal(`https://explorer.firo.org/tx/${this.txid}`);
                } else if (this.network === 'test') {
                    shell.openExternal(`https://testexplorer.firo.org/tx/${this.txid}`);
                }
            }
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";

.txid {
    @include txid();
}

a {
    @include supermini();
}
</style>
