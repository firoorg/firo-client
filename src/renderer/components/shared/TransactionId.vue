<template>
    <div class="transaction-id-component">
        <span class="txid">{{ txid }}</span><a v-if="showOpenInBlockExplorer" @click="openInBlockExplorer">👁</a>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';
import {shell} from 'electron';
import Copyable from "renderer/components/shared/Copyable";

export default {
    name: "TransactionId",

    components: {
        Copyable
    },

    props: {
        txid: String,
    },

    computed: {
        ...mapGetters({
            network: 'ApiStatus/network'
        }),

        showOpenInBlockExplorer() {
            return !['regtest', 'regtest-ql'].includes(this.network);
        }
    },

    methods: {
        openInBlockExplorer() {
            if (confirm("This link will take you to an external block explorer. Explorers may log your IP address " +
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
a {
    margin-left: 2px;
    text-decoration: none;
    font-size: 8px;
    vertical-align: top;
}
</style>
