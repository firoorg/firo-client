<template>
    <div
        class="payments"
        :class="{ 'show-validate': showValidate }"
    >
        <div
            v-for="(value, key) in payments"
            :key="key"
        >
            <div class="addr-info">
                <!--<slot v-bind="value" />-->
                <div class="label">
                    {{ value.label }}
                </div>
                <div class="address">
                    {{ value.address }}
                </div>
            </div>
            <div class="amount">
                {{ value.amountAsBaseCoin }} <span class="unit">XZC</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PendingPayments',
    props: {
        showValidate: {
            type: Boolean,
            default: true
        },

        payments: {
            type: Array,
            required: true
        }
    }
}
</script>

<style lang="scss" scoped>
    .payments {
        list-style: none;
        padding: 0;
        border-bottom-color: rgba($color--white, 0.5);
        border-bottom-style: solid;
        @include rhythmBorderBottom(1px, 1);
        margin: 0;

        .addr-info {
            .label {
                display: inline-block;
                margin-right: 1em;
            }

            .address {
                display: inline-block;
                float: right;
                font-style: italic;
            }
        }

        .amount {
            font-weight: bold;
        }
    }
</style>
