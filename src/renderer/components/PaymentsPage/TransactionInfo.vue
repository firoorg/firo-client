<template>
    <div>
        <div class="title">
            Transaction Information
        </div>

        <div class="content">
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

                    <div class="value status">
                        UNCONFIRMED
                    </div>
                </div>
            </template>

            <div class="field">
                <label>
                    Transaction ID
                </label>

                <div class="value">
                    {{ tx.txid }}
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

        <div class="buttons">
            <button @click="$emit('ok')">
                OK
            </button>
        </div>
    </div>
</template>

<script>
// $emits: ok
import Amount from "renderer/components/Amount";
import { format } from 'date-fns'

export default {
    name: "TransactionInfo",

    components: {
        Amount
    },

    props: {
        // This is a TransactionOutput from src/daemon/firod.ts
        tx: {
            type: Object,
            required: true
        }
    },

    computed: {
        formattedBlockTime() {
            return format(new Date(this.tx.blockTime * 1000), "HH:MM, D MMM YYYY");
        }
    },

    methods: {
        viewInBlockExplorer() {
            alert('hi');
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";

@include info-popup();
</style>