<template>
    <section class="fees-amount">
        <template v-if="hasPayments">
            <h3>Payments</h3>
            <pending-payments :payments="payments"
                              class="pending-payments" />

            <h3>Fees <a href @click.prevent="onChangeFee" class="change-fee">change</a></h3>
            <dl>
                <dt class="fees">{{ fee.label }}</dt>
                <dd class="fees">
                    <span class="value">{{ fee.amount }}</span> <span class="unit">xzc</span>
                </dd>
                <dt class="amount">Total</dt>
                <dd class="amount">
                    <span class="value">{{ total }}</span> <span class="unit">XZC</span>
                </dd>
            </dl>
        </template>
    </section>
</template>

<script>
    import PendingPayments from '@/components/PendingPayments'

    export default {
        name: 'FeesAndAmount',
        components: {
            PendingPayments
        },
        props: {
            fee: {
                type: Object,
                required: true
            },
            payments: {
                type: Object,
                default: {}
            },
            onChangeFee: {
                type: Function,
                default: () => {}
            }
        },

        computed: {
            hasPayments () {
                return Object.keys(this.payments).length
            },

            total () {
                const total = Object
                    .values(this.payments)
                    .reduce((accumulator, payment) => accumulator + payment.amount, 0)

                return total + this.fee.amount
            }
        }
    }
</script>

<style lang="scss" scoped>

    h3 {
        @include setType(2);
        font-style: italic;
        margin: emRhythm(2) 0 emRhythm(1);
    }

    .pending-payments {
        margin-bottom: emRhythm(3);
    }

    dl {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: auto auto;
        margin: 0;
    }

    dt, dd {
        margin-bottom: emRhythm(2);

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
        position: relative;
        display: block;
    }

    dt.amount {
        @include setType(4, $ms-up1);
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

    .change-fee {
        color: $color--white-light;
        font-style: normal;
        text-decoration: none;
        background: rgba($color--green-dark, 0.3);
        @include setType(2, $ms-down2);
        text-transform: uppercase;
        letter-spacing: 0.025rem;
        display: inline-block;
        padding: emRhythm(0.75, $silent: true) emRhythm(1);
        margin: -1 * emRhythm(0.75, $silent: true) 0;

        transition: color 0.15s ease-out, background 0.15s ease-out;

        //position: absolute;
        //right: 0;
        //margin-right: -50%;
        //top: 0;

        &:hover,
        &:focus {
            color: $color--white;
            background: $color--green-dark;
        }
    }
</style>