<template>
    <div class="content-wrapper">
        <!-- padding: 3.2em is applied to top-level children of .content-wrapper -->
        <div>
            <div class="description">
                <h2>
                    {{ $t('send.public.flyout-confirm-send.title') }}
                </h2>

                <p>
                    Check carefully before sending.
                </p>
            </div>

            <div>
                <div class="label">
                    {{ label }}
                </div>

                <div class="address">
                    {{ address }}
                </div>
            </div>

            <div
                v-if="fee"
                class="amount"
            >
                {{ convertToCoin(amount) }} XZC
            </div>

            <div>
                <div
                    v-if="fee"
                    class="fee"
                >
                    <label>
                        Fee:
                    </label>

                    <span class="feeAmount">
                        {{ convertToCoin(fee) }} XZC
                    </span>
                </div>
            </div>

            <div class="total">
                <hr />

                <label>
                    Total:
                </label>

                <span class="totalAmount">
                    {{ convertToCoin(fee + amount) }} XZC
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { convertToCoin } from 'lib/convert'

export default {
    name: 'SendStepConfirm',

    props: {
        label: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        fee: {
            type: Number,
            required: true
        }
    },

    methods: {
        convertToCoin
    }
}
</script>

<style scoped lang="scss">
.description {
    h2 {
        margin-bottom: 0px;
    }

    p {
        margin-top: 0px;
        font-style: italic;
    }

    margin-bottom: 2em;
}

.label {
    display: inline-block;
    margin-right: 3em;
}

.address {
    display: inline-block;
    float: right;
    font-style: italic;
}

.amount, .feeAmount, .totalAmount {
    font-weight: bold;
}

.amount, .fee, .total {
    text-align: right;
}

.total {
    border-top-width: 100px;
    border-top-color: white;
}
</style>
