<template>
    <ul class="payments">
        <li v-for="(value, key) in payments" :key="key">
            <div class="label">
                <!--<slot v-bind="value" />-->
                {{ value.label }}
            </div>
            <div class="amount">
                {{ value.amount }} <span class="unit">xzc</span>
            </div>
        </li>
    </ul>
</template>

<script>
    export default {
        name: 'PendingPayments',
        props: {
            payments: {
                type: Object,
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

        li {
            padding-top: emRhythm(1);
            @include rhythmBorderBottom(1px, 1);
            border-color: rgba($color--white, 0.3);
            border-bottom-style: dashed;
            @include font-medium();

            display: grid;
            grid-template-columns: auto auto;

            &:last-child {
                border: none;
                padding-bottom: emRhythm(1);
            };

            .amount {
                align-self: end;
                text-align: right;
            }
        }
    }
</style>