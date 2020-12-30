<template>
    <div>
        <div class="title">
            Confirm {{ isPrivate ? '' : 'Public '}}Send
        </div>

        <div class="content">
            <div v-if="label" class="field">
                <label>
                    Label
                </label>

                <div class="value">
                    {{ label }}
                </div>
            </div>

            <div class="field">
                <label>
                    Address
                </label>

                <div class="address value">
                    {{ address }}
                </div>
            </div>

            <div class="field">
                <label>
                    Amount
                </label>

                <div class="value">
                    <Amount :amount="amount" /> <span class="ticker">FIRO</span>
                </div>
            </div>

            <div class="field">
                <label>
                    Fee
                </label>

                <div class="value">
                    <Amount :amount="fee" /> <span class="ticker">FIRO</span>
                </div>
            </div>

            <div class="field">
                <label>
                    Total
                </label>

                <div class="value">
                    <Amount :amount="total" /> <span class="ticker">FIRO</span>
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
import Amount from "renderer/components/Amount";

export default {
    name: 'SendStepConfirm',

    components: {
        Amount
    },

    props: {
        isPrivate: {
            required: true,
            type: Boolean
        },

        label: {
            required: true,
            type: String
        },

        address: {
            required: true,
            type: String
        },

        amount: {
            required: true,
            type: Number
        },

        fee: {
            required: true,
            type: Number
        },

        total: {
            required: true,
            type: Number
        }
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
}

.content {
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
