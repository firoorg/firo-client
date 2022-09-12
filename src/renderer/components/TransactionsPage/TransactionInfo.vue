<template>
    <div v-if="rebroadcastingStep === 'wait'">
        <WaitOverlay />
    </div>

    <div v-else-if="rebroadcastingStep === 'error'" class="info-popup">
        <div class="title">
            Rebroadcast Failed
        </div>

        <div class="content">
            {{ rebroadcastingError }}
        </div>

        <div class="buttons">
            <button class="solid-button recommended" @click="rebroadcastingError = rebroadcastingStep = null">
                OK
            </button>
        </div>
    </div>

    <div v-else-if="rebroadcastingStep === 'success'" class="info-popup">
        <div class="title">
            Success!
        </div>

        <div class="content">
            Your transaction has been rebroadcast to the network.
        </div>

        <div class="buttons">
            <button class="solid-button recommended" @click="rebroadcastingStep = null">
                OK
            </button>
        </div>
    </div>

    <div v-else class="info-popup">
        <div class="title">
            Transaction Information
        </div>

        <table>
            <template v-if="tx.blockHeight">
                <tr>
                    <td>Block Height</td>
                    <td>{{ tx.blockHeight }}</td>
                </tr>

                <tr>
                    <td>Block Hash</td>
                    <td class="monospace">{{ tx.blockHash }}</td>
                </tr>

                <tr>
                    <td>Block Time</td>
                    <td>{{ formattedBlockTime }}</td>
                </tr>
            </template>

            <tr v-else-if="tx.isInstantSendLocked && !tx.elysium">
                <td>Status</td>
                <td>InstantSend Locked</td>
            </tr>

            <tr v-else>
                <td>Status</td>
                <td>Unconfirmed <a href="#" class="rebroadcast" @click="rebroadcast">(rebroadcast)</a></td>
            </tr>

            <tr>
                <td>Confirmations</td>
                <td>{{ confirmations }}</td>
            </tr>

            <tr>
                <td>Transaction Privacy</td>
                <td>{{ tx.inputPrivacy }}</td>
            </tr>

            <tr>
                <td>Transaction ID</td>
                <td><TransactionId :txid="tx.txid" /></td>
            </tr>

            <tr>
                <td>Transaction Index</td>
                <td>{{ tx.index }}</td>
            </tr>

            <tr v-if="tx.elysium">
                <td>Transaction Type</td>
                <td>{{ tx.elysium.type }}</td>
            </tr>

            <tr v-if="tx.elysium && tx.elysium.sender">
                <td>Sender Address</td>
                <td>{{ tx.elysium.sender }}</td>
            </tr>

            <tr v-if="tx.elysium ? tx.elysium.receiver : tx.destination">
                <td>Recipient Address</td>
                <td v-if="tx.elysium">{{ tx.elysium.receiver }}</td>
                <td v-else>{{ tx.destination }}</td>
            </tr>

            <template v-if="tx.elysium && tx.elysium.property">
                <tr>
                    <td>Property ID</td>
                    <td class="elysium-property-id">{{ tx.elysium.property.id }}</td>
                </tr>

                <tr>
                    <td>Property Creation Tx</td>
                    <td class="elysium-property-creation-tx"><TransactionId :txid="tx.elysium.property.creationTx"/></td>
                </tr>

                <tr>
                    <td>Property Name</td>
                    <td>{{ tx.elysium.property.name }}</td>
                </tr>

                <tr v-if="tx.elysium.property.url">
                    <td>Property URL</td>
                    <td v-if="isValidUrl"><a @click="openExternal(tx.elysium.property.url)" href="#">{{ tx.elysium.property.url }}</a></td>
                    <td v-else>{{ tx.elysium.property.url }}</td>
                </tr>
            </template>

            <tr>
                <td>Fee</td>
                <td class="fee"><Amount :amount="tx.fee" ticker="FIRO" /></td>
            </tr>

            <tr>
                <td>Received Amount</td>
                <td v-if="tx.elysium" class="received-amount"><ElysiumAmount :tx="tx" /></td>
                <td v-else class="received-amount"><Amount :amount="tx.amount" ticker="FIRO" /></td>
            </tr>
        </table>

        <div class="buttons">
            <button class="solid-button recommended txinfo-ok" @click="$emit('ok')">
                OK
            </button>
        </div>
    </div>
</template>

<script>
// $emits: ok
import electron from "electron";
import {mapGetters} from "vuex";
import { format } from 'date-fns'
import Popup from "renderer/components/shared/Popup";
import Amount from "renderer/components/shared/Amount";
import WaitOverlay from "renderer/components/shared/WaitOverlay";
import TransactionId from "renderer/components/shared/TransactionId";
import Copyable from "renderer/components/shared/Copyable";
import ElysiumAmount from "renderer/components/shared/ElysiumAmount";

export default {
    name: "TransactionInfo",

    components: {
        WaitOverlay,
        Popup,
        Amount,
        TransactionId,
        Copyable,
        ElysiumAmount
    },

    props: {
        // This is a TXO from store/Transactions.ts
        tx: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            rebroadcastingStep: null,
            rebroadcastingError: null
        }
    },

    computed: {
        ...mapGetters({
            currentBlockHeight: 'ApiStatus/currentBlockHeight'
        }),

        confirmations() {
            if (!this.tx.blockHeight) return 0;
            return this.currentBlockHeight - this.tx.blockHeight + 1;
        },

        formattedBlockTime() {
            return format(this.tx.blockTime * 1000, "hh:mm:ss, D MMM YYYY");
        },

        isValidUrl() {
            if (!this.tx.elysium || !this.tx.elysium.property.url) return false;
            try {
                const parsed = new URL(this.tx.elysium.property.url);
                return parsed.protocol === 'https:';
            } catch {
                return false;
            }
        }
    },

    methods: {
        openExternal: electron.shell.openExternal,

        copy(...ev) {
            document.ev = ev;
        },

        async rebroadcast() {
            this.rebroadcastingStep = 'wait';
            try {
                await $daemon.rebroadcast(this.tx.txid);
            } catch (e) {
                this.rebroadcastingStep = 'error';
                this.rebroadcastingError = `${e}`;
                return;
            }
            this.rebroadcastingStep = 'success';
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";

.info-popup {
    table {
        .rebroadcast {
            font-size: 0.8em;
        }
    }
}
</style>