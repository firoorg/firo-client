<template>
    <section class="fees-amount">
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

        <dl v-if="hasPayments">
            <dt class="fees">Fees</dt>
            <dd class="fees">
                <span class="value">{{ fee }}</span> <span class="unit">xzc</span>
            </dd>
            <dt class="amount">Amount</dt>
            <dd class="amount">
                <span class="value">{{ total }}</span> <span class="unit">XZC</span>
            </dd>
        </dl>
    </section>
</template>

<script>
    export default {
        name: 'FeesAndAmount',
        props: {
            feesPerKb: {
                type: Number,
                required: true
            },
            payments: {
                type: Object,
                default: {}
            }
        },

        computed: {
            hasPayments () {
                return Object.keys(this.payments).length
            },

            fee () {
                return this.feesPerKb
            },

            total () {
                const total = Object
                    .values(this.payments)
                    .reduce((accumulator, payment) => accumulator + payment.amount, 0)

                return total + this.fee
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
        }
    }

    dl {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: auto auto;
        margin: 0;
    }

    dt, dd {
        margin-bottom: emRhythm(1);

        &:last-of-type {
            margin-bottom: 0;
        }
    }

    dt {
        align-self: end;
    }

    dd,
    li > .amount {
        align-self: end;
        text-align: right;
    }

    dt.fees {
        font-style: italic;
    }

    dt.amount {
        @include setType(4);
        @include font-heavy();
    }

    dd.amount {
        .value {
            @include setType(4, $ms-up2);
            @include font-black();
        }
    }

    .unit {
        opacity: 0.5;
    }
</style>