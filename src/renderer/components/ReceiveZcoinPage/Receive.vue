<template>
    <div
        v-scrollable
        class="receive"
    >
        <header class="receive-header">
            <div class="inner">
                <div>{{ $d(new Date(createdAt), 'long') }}</div>
                <editable-label
                    :label="label"
                    @submit="onLabelUpdate"
                >
                    <natural-language-tags
                        :content="label"
                        tag-size="large"
                    />
                </editable-label>
                <div class="amount-delete">
                    <div
                        v-if="amount"
                        class="amount"
                    >
                        {{ amountInBaseCoin }} XZC {{ $t('receive.detail-entry-request.label__requested') }}
                    </div>
                    <div
                        v-else
                        class="amount"
                    >
                        {{ $t('receive.detail-entry-request.label__no-amount') }}
                    </div>

                    <div
                        v-if="deleteIconIsVisible"
                        class="delete"
                    >
                        <base-popover
                            placement="left"
                            popover-class="popover"
                            :auto-hide="true"
                        >
                            <template slot="content">
                                <div class="delete-popover">
                                    <div class="caption">
                                        {{ $t('receive.delete-request.are-you-sure') }}
                                    </div>

                                    <div class="buttons">
                                        <base-button
                                            v-close-popover
                                        >
                                            {{ $t('receive.delete-request.cancel') }}
                                        </base-button>
                                        <base-button
                                            class="dark-button"
                                            @click.prevent="deletePaymentRequest"
                                        >
                                            {{ $t('receive.delete-request.confirm') }}
                                        </base-button>
                                    </div>
                                </div>
                            </template>

                            <template slot="target">
                                <base-round-button
                                    color="light"
                                    size="large"
                                >
                                    <delete-icon />
                                </base-round-button>
                            </template>
                        </base-popover>
                    </div>
                </div>
                <span class="address">
                    {{ address }}
                </span>
            </div>
        </header>

        <receive-fulfilled-payment-request
            v-if="transactionsReceived"
            :message="message"
            :is-reused="isReused"
            :transactions="transactions"
        />
        <receive-pending-payment-request
            v-else
            :message="message"
        />

        <div class="actions">
            <receive-fulfilled-payment-request-buttons
                v-if="isFulfilled"
                :address="address"
            />
            <receive-pending-payment-request-buttons
                v-else
                :address="address"
                :amount="amount"
                :message="message"
            />
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { convertToCoin } from '#/lib/convert'

import ReceivePendingPaymentRequest from '@/components/ReceiveZcoinPage/ReceivePendingPaymentRequest'
import ReceivePendingPaymentRequestButtons from '@/components/ReceiveZcoinPage/ReceivePendingPaymentRequestButtons'
import ReceiveFulfilledPaymentRequest from '@/components/ReceiveZcoinPage/ReceiveFulfilledPaymentRequest'
import ReceiveFulfilledPaymentRequestButtons from '@/components/ReceiveZcoinPage/ReceiveFulfilledPaymentRequestButtons'

import ReceivePaymentRequestEmailTemplate from '@/components/email/ReceivePaymentEmailTemplate'
import EditableLabel from '@/components/payments/Detail/EditableLabel'
import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'
import PaymentRequestStatus from '@/components/Icons/PaymentRequestStatus'
import TimedTooltip from '@/components/Notification/TimedTooltip'
import UnexpectedTransactionPopover from '@/components/ReceiveZcoinPage/UnexpectedTransactionPopover'
import DeleteIcon from "@/components/Icons/DeleteIcon";
import BasePopover from "../base/BasePopover";
import BaseButton from "../base/BaseButton";

export default {
    name: 'ReceivePaymentRequest',
    components: {
        BaseButton,
        BasePopover,
        ReceivePendingPaymentRequest,
        ReceivePendingPaymentRequestButtons,
        ReceiveFulfilledPaymentRequest,
        ReceiveFulfilledPaymentRequestButtons,

        UnexpectedTransactionPopover,
        PaymentRequestStatus,
        EditableLabel,
        NaturalLanguageTags,
        ReceivePaymentRequestEmailTemplate,
        TimedTooltip,
        DeleteIcon
    },

    computed: {
        ...mapGetters({
            getLastSeen: 'PaymentRequest/paymentRequestLastSeen',
            paymentRequests: 'PaymentRequest/paymentRequests',
            transactionsByAddress: 'Transactions/addresses'
        }),

        // The address of the payment request we're trying to view information about is given as a parameter when our
        // page is requested.
        address () {
            return this.$route.params.address;
        },

        paymentRequest () {
            return this.paymentRequests[this.address];
        },

        transactions () {
            return this.transactionsByAddress[this.address] || [];
        },

        transactionsReceived () {
            return !!this.transactions.length;
        },

        isFulfilled () {
            return this.transactionsReceived;
        },

        isIncoming () {
            return !this.transactionsReceived;
        },

        label () {
            return this.paymentRequest.label;
        },

        amount () {
            return this.paymentRequest.amount;
        },

        message () {
            return this.paymentRequest.message;
        },

        createdAt () {
            return this.paymentRequest.createdAt;
        },

        state () {
            return this.paymentRequest.state || 'active';
        },

        deleteIconIsVisible () {
            return !this.transactions.length
        },

        amountInBaseCoin () {
            return convertToCoin(this.amount)
        }
    },

    methods: {
        async onLabelUpdate({ label }) {
            let pr = await this.$daemon.updatePaymentRequest(this.address, this.amount, label, this.message, 'active');
            this.$store.dispatch('PaymentRequest/addOrUpdatePaymentRequestFromResponse', pr);
        },

        // Yes, confusing terminology, but imo it makes sense--front end is deleting the payment request, but it's only
        // getting archived on the backend.
        async deletePaymentRequest () {
            let pr = await this.$daemon.updatePaymentRequest(this.address, this.amount, this.label, this.message, 'archived');
            this.$store.dispatch('PaymentRequest/addOrUpdatePaymentRequestFromResponse', pr);

            this.$router.replace('/');
        }
    }
}
</script>

<style lang="scss" scoped>
    .receive {
        @include detail-wrap();
        height: 100vh;
    }

    .receive-header {
        @include detail-header();

        .inner {
            span {
                display: block;
            }
        }
    }

    .actions {
        @include detail-actions();
    }

    .amount-delete {
        .amount {
            display: inline-block;
            float: left;
        }

        .delete {
            display: inline-block;
            float: right;
            cursor: pointer;
        }
    }

    .delete-popover {
        font-size: 0.8em;

        .dark-button {
            @include dark-input();
        }

        .caption {
            font-weight: bold;
            font-size: 1.2em;
            padding-bottom: 1.2em;
        }

        .buttons {
            text-align: right;
        }
    }
</style>
