<template>
    <div class="is-fulfilled">
        <h2 class="payments-headline">
            {{ $t('receive.detail-entry-request.title__payments') }}
            <span v-if="transactions.length > 1">
                ({{ transactions.length }})
            </span>
        </h2>
        <div
            style="overflow: hidden"
            class="scrollable-container-wrap"
        >
            <div :style="{ height: '100%' }">
                <unexpected-transaction-popover :is-reused="isReused">
                    <transactions-list
                        :transactions="transactions"
                        class="scrollable-container"
                    />
                </unexpected-transaction-popover>
            </div>

            <div class="message-wrap">
                <h2 v-html="$t('receive.detail-entry-request.title__message')" />
                <div v-html="messageFormatted" />
            </div>
        </div>
    </div>
</template>

<script>
import { nl2br } from '@/utils/format'

import UnexpectedTransactionPopover from '@/components/ReceiveZcoinPage/UnexpectedTransactionPopover'
import TransactionsList from '@/components/payments/TransactionsList'

export default {
    name: 'ReceiveFulfilledPaymentRequest',

    components: {
        UnexpectedTransactionPopover,
        TransactionsList
    },

    props: {
        transactions: {
            type: Array,
            required: true
        },
        isReused: {
            type: Boolean,
            required: true
        },
        address: {
            type: Object,
            required: true
        },
        message: {
            type: String,
            default: null
        }
    },

    computed: {
        messageFormatted () {
            return nl2br(this.message)
        }
    }
}
</script>

<style lang="scss" scoped>
    .scrollable-container-wrap {
        overflow: hidden;
    }

    .is-fulfilled {
        display: grid;
        grid-template-rows: auto 1fr auto;
        overflow: hidden;

        h2 {
            @include font-black();
            @include setType(2, $ms-up1);
        }

        .payments-headline {
            margin-left: emRhythm(3, $ms-up1);
        }

        .message-wrap {
            margin-left: emRhythm(3);
        }

        .unexpected-transaction-popover {
            height: 100%;

            & /deep/ .trigger {
                width: 100%;
                height: 100%;
            }
        }

        /*.message-wrap {
            @include divider-top-with-gradient();
            margin: 0 emRhythm(3);
        }*/

    }
</style>
