<template>
    <div v-if="rebroadcastingStep === 'wait'">
        <WaitOverlay />
    </div>

    <div v-else-if="rebroadcastingStep === 'error'" class="rebroadcast-status">
        <div class="title">
            Rebroadcast Failed
        </div>

        <div class="content">
            {{ rebroadcastingError }}
        </div>

        <div class="buttons">
            <button @click="rebroadcastingError = rebroadcastingStep = null">
                OK
            </button>
        </div>
    </div>

    <div v-else-if="rebroadcastingStep === 'success'" class="rebroadcast-status">
        <div class="title">
            Success!
        </div>

        <div class="content">
            Your transaction has been rebroadcast to the network.
        </div>

        <div class="buttons">
            <button @click="rebroadcastingStep = null">
                OK
            </button>
        </div>
    </div>

    <div v-else class="info-popup">
        <div class="title">
            Transaction Information
        </div>

        <div class="content">
            <div class="fields">
                <template v-if="tx.blockHeight">
                    <div class="field">
                        <label>
                            Block Height
                        </label>

                        <div class="value">
                            {{ tx.blockHeight }}
                        </div>
                    </div>

                    <div class="field">
                        <label>
                            Block Hash
                        </label>

                        <div class="value">
                            {{ tx.blockHash }}
                        </div>
                    </div>

                    <div class="field">
                        <label>
                            Block Time
                        </label>

                        <div class="value">
                            {{ formattedBlockTime }}
                        </div>
                    </div>
                </template>

                <template v-else>
                    <div class="field">
                        <label>
                            Status
                        </label>

                        <div class="value status unconfirmed">
                            <div class="text">UNCONFIRMED</div>

                            <a href="#" class="rebroadcast" @click="rebroadcast">
                                Rebroadcast
                            </a>
                        </div>
                    </div>
                </template>

                <div class="field">
                    <label>
                        Confirmations
                    </label>

                    <div class="value">
                        {{ confirmations }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Category
                    </label>

                    <div class="value">
                        {{ tx.category }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Transaction ID
                    </label>

                    <div class="value">
                        <TransactionId :txid="tx.txid" />
                    </div>
                </div>

                <div class="field">
                    <label>
                        Transaction Index
                    </label>

                    <div class="value">
                        {{ tx.txIndex }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Recipient Address
                    </label>

                    <div class="value">
                        {{ tx.address }}
                    </div>
                </div>

                <div v-if="tx.fee" class="field">
                    <label>
                        Fee
                    </label>

                    <div class="value">
                        <Amount :amount="tx.fee" ticker="FIRO" />
                    </div>
                </div>

                <div class="field">
                    <label>
                        Received Amount
                    </label>

                    <div class="value">
                        <Amount :amount="tx.amount" ticker="FIRO" />
                    </div>
                </div>
            </div>
        </div>

        <div class="buttons">
            <button @click="$emit('ok')">
                OK
            </button>
        </div>
    </div>
</template>

<script>
// $emits: ok
import {mapGetters} from "vuex";
import { format } from 'date-fns'
import Popup from "renderer/components/shared/Popup";
import Amount from "renderer/components/shared/Amount";
import WaitOverlay from "renderer/components/shared/WaitOverlay";
import TransactionId from "renderer/components/shared/TransactionId";

export default {
    name: "TransactionInfo",

    components: {
        WaitOverlay,
        Popup,
        Amount,
        TransactionId
    },

    props: {
        // This is a TransactionOutput from src/daemon/firod.ts
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
        }
    },

    methods: {
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
@import "src/renderer/styles/popup";
@import "src/renderer/styles/info-popup";
@import "src/renderer/styles/typography";

.rebroadcast-status {
    @include popup();

    .content {
        @include guidance();
    }
}

.info-popup {
    @include info-popup();

    .unconfirmed {
        a {
            display: block;
            margin-top: $size-between-field-space-small / 2;
            @include supermini();
            @include optional-action();
        }
    }
}
</style>