<template>
    <div>
        <div class="title">
            Swap to Firo
        </div>

        <div class="content">
            <div id="swapToFiroQrCode" />

            <div class="field">
                <label>
                    Amount to Send
                </label>

                <div class="value">
                    <span class="amount">{{ fromAmount }}</span> <span class="ticker">{{ fromCurrency }}</span>
                </div>
            </div>

            <div v-if="feeFrom" class="field">
                <label>
                    {{ fromCurrency }} Fee
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
import Amount from "renderer/components/shared/Amount";
import QRCode from "easyqrcodejs";

export default {
    name: 'SendStepConfirm',

    components: {
        Amount
    },

    props: {
        rate: {
            type: String,
            required: true
        },

        exchangeAddress: {
            type: String,
            required: true
        },

        remoteAmount: {
            type: String,
            required: true
        },

        remoteCurrency: {
            type: String,
            required: true
        },

        firoAmount: {
            type: String,
            required: true
        },

        firoTransactionFee: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            qrCode: null
        }
    },

    methods: {
        convertToCoin,

        makeQrCode() {
            if (this.qrCode) {
                this.qrCode.makeCode(this.exchangeAddress);
            } else {
                this.qrCode = new QRCode(this.$refs.qrCode, {
                    text: this.address,
                    height: 256,
                    width: 256,
                    colorDark: 'black',
                    colorLight: 'white'
                });
            }
        }
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
