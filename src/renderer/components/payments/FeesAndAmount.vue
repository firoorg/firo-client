<template>
    <section class="fees-amount">
        <template v-if="showFee">
            <h3 v-if="canChangeFee">
                {{ $t('send.public.flyout-confirm-send.title__fees') }} <a
                    href
                    class="change-fee"
                    @click.prevent="onChangeFee"
                >
                    {{ $t('send.public.flyout-confirm-send.label__change-fees') }}
                </a>
            </h3>
        </template>
        <dl>
            <template v-if="showFee">
                <dt class="fees">
                    {{ fee.label }}
                </dt>
                <dd class="fees">
                    <span class="value">
                        {{ feeAmountAsBaseCoin }}
                    </span> <span class="unit">
                        xzc
                    </span>
                </dd>
            </template>
            <dt class="amount">
                {{ $t(`${translationNamespace}.label__amount`) }}
            </dt>
            <dd class="amount">
                <span class="value">
                    {{ totalAsBaseCoin }}
                </span> <span class="unit">
                    XZC
                </span>
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
    components: {
        PendingPayments
    },
    mixins: [
        TranslationNamespaceMixin
    ],
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
        // grid-template-rows: 1fr 1fr;
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
        @include popover-inline-button();
    }
</style>
