<template>
    <div>
        <div class="title">
            Confirm Swap
        </div>

        <div class="content">
            <div class="field">
                <label>
                    Amount to Send
                </label>

                <div class="value">
                    <span class="amount">{{ amountFrom }}</span> <span class="ticker">{{ fromCurrency }}</span>
                </div>
            </div>

            <div v-if="fromCurrency === 'FIRO'" class="field">
                <label>
                    FIRO Fee
                </label>

                <div class="value">
                    <span class="amount">{{ feeFrom }}</span> <span class="ticker">FIRO</span>
                </div>
            </div>

            <div class="field">
                <label>
                    {{ toCurrency }} Fee
                </label>

                <div class="value">
                   <span class="amount">{{ feeTo }}</span> <span class="ticker">{{ toCurrency }}</span>
                </div>
            </div>

            <div class="field">
                <label>
                    Estimated Total to Receive
                </label>

                <div class="value">
                    <span class="amount">{{ amountTo }}</span> <span class="ticker">{{ toCurrency }}</span>
                </div>
            </div>

            <div class="field">
                <label>
                    {{ fromCurrency === 'FIRO' ? toCurrency : fromCurrency }} Address
                </label>

                <div class="value address">
                    <span>{{ address }}</span>
                </div>
            </div>
        </div>

        <div class="buttons">
            <button class="disrecommended" @click="$emit('cancel')">
                Cancel
            </button>

            <button @click="$emit('confirm')">
                Continue
            </button>
        </div>
    </div>
</template>

<script>
// $emits: cancel, confirm
import { convertToCoin } from 'lib/convert'
import Amount from "renderer/components/Sidebar/Amount";

export default {
    name: 'SendStepConfirm',

    components: {
        Amount
    },

    props: {
        fromCurrency: {
           type: String,
           required: true
        },

        toCurrency: {
            type: String,
            required: true
        },

        amountFrom: {
            type: String,
            required: true
        },

        amountTo: {
            type: String,
            required: true
        },

        feeFrom: {
            type: String,
            required: true
        },

        feeTo: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },
    },

    methods: {
        convertToCoin
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";
@import "src/renderer/styles/inputs";
@import "src/renderer/styles/popup";

@include popup();

.ticker {
    @include ticker();
}

.address {
    @include address();
    font-size: 80%;
}

.amount {
    @include amount();
}

.content {
    // We do NOT want the size to be adaptive to the screen.
    width: 400pt;

    .field {
        margin-bottom: $size-between-field-space-small;

        label {
            margin-right: $size-medium-space;
            width: fit-content;
            @include label();
        }

        .value {
            width: available;
            display: inline;
            float: right;
        }
    }
}
</style>
