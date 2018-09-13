<template>
    <section class="fees-amount">
        <template v-if="showFee">
            <h3 v-if="canChangeFee">
                {{ $t('send.public.flyout-confirm-send.title__fees') }} <a href @click.prevent="onChangeFee" class="change-fee">{{ $t('send.public.flyout-confirm-send.label__change-fees')}}</a>
            </h3>
        </template>
        <dl>
            <template v-if="showFee">
                <dt class="fees">{{ fee.label }}</dt>
                <dd class="fees">
                    <span class="value">{{ feeAmountAsBaseCoin }}</span> <span class="unit">xzc</span>
                </dd>
            </template>
            <dt class="amount">{{ $t(`${translationNamespace}.label__amount`) }}</dt>
            <dd class="amount">
                <span class="value">{{ totalAsBaseCoin }}</span> <span class="unit">XZC</span>
            </dd>
        </dl>
    </section>
</template>

<script>
    import { convertToCoin } from '#/lib/convert'
    import PendingPayments from '@/components/payments/PendingPayments'
    import TranslationNamespaceMixin from '@/mixins/TranslationNamespaceMixin'

    export default {
        name: 'FeesAndAmount',
        mixins: [
            TranslationNamespaceMixin
        ],
        components: {
            PendingPayments
        },
        props: {
            amount: {
                type: Number,
                required: true
            },
            fee: {
                type: Object,
                default: () => ({ amount: 0, label: '' })
            },
            canChangeFee: {
                type: Boolean,
                default: false
            },
            onChangeFee: {
                type: Function,
                default: () => {}
            },
            showFee: {
                type: Boolean,
                default: true
            }
        },

        computed: {
            total () {
                return this.amount + this.fee.amount
            },
            totalAsBaseCoin () {
                return convertToCoin(this.total)
            },
            feeAmountAsBaseCoin () {
                return convertToCoin(this.fee.amount)
            }
        }
    }
</script>

<style lang="scss" scoped>
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
            padding-right: emRhythm(.25, $ms-up2, $silent: true);
        }
    }

    .unit {
        opacity: 0.5;
    }

    .change-fee {
        color: $color--white-light;
        font-style: normal;
        text-decoration: none;
        background: rgba($color--dark, 0.3);
        @include setType(2, $ms-down2);
        text-transform: uppercase;
        letter-spacing: 0.025rem;
        display: inline-block;
        padding: emRhythm(0.75, $silent: true) emRhythm(1);
        margin: -1 * emRhythm(0.75, $silent: true) 0;
        border-radius: emRhythm(0.25, $silent: true);

        transition: color 0.15s ease-out, background 0.15s ease-out;

        //position: absolute;
        //right: 0;
        //margin-right: -50%;
        //top: 0;

        &:hover,
        &:focus {
            color: $color--white;
            background: rgba($color--dark, 0.85);
        }
    }
</style>
