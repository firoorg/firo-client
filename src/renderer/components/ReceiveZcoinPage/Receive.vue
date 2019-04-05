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
                        :on-tag-click="tagClicked"
                    />
                </editable-label>
                <div class="amount-delete">
                    <div v-if="amount" class="amount">
                        {{ amountInBaseCoin }} XZC {{ $t('receive.detail-entry-request.label__requested') }}
                    </div>
                    <div v-else class="amount">
                        {{ $t('receive.detail-entry-request.label__no-amount') }}
                    </div>

                    <div v-if="deleteIconIsVisible" class="delete" >
                        <base-popover
                            placement="left"
                            popover-class="popover"
                            :auto-hide="true"
                        >
                            <template slot="content">
                                <div class="delete-popover">
                                    <div class="caption">
                                        Are you sure you want to delete this payment request?
                                    </div>

                                    <div class="buttons">
                                        <base-button
                                            v-close-popover
                                        >
                                            No, Cancel
                                        </base-button>
                                        <base-button
                                            class="dark-button"
                                            @click.prevent="deletePaymentRequest"
                                        >
                                            Yes, I'm Sure
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
                    {{ getAddress }}
                </span>
                <!--
                    <i v-if="!isFulfilled"
                       class="qr-toggle el-icon-menu"
                       @click="toggleQrCode">
                    </i>
                    -->
            </div>
            <div
                v-show="!qrCodeIsVisible"
                class="status"
                :class="{ 'is-fulfilled': isFulfilled }"
            >
                <payment-request-status
                    :is-fulfilled="isFulfilled"
                    :is-incoming="isIncoming"
                    :is-reused="isReused"
                />
            </div>
        </header>

        <receive-fulfilled-payment-request
            v-if="transactionsReceived"
            :address="address"
            :message="message"
            :is-reused="isReused"
            :is-fulfilled="isFulfilled"
            :transactions="address.transactions"
        />
        <receive-pending-payment-request
            v-else
            :message="message"
        />

        <div class="actions">
            <receive-fulfilled-payment-request-buttons
                v-if="hasAmountReceived"
                :address="address.address"
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
import { mapGetters, mapActions } from 'vuex'
import { convertToCoin } from '#/lib/convert'

import types from '~/types'

// import VueQRCodeComponent from 'vue-qrcode-component'

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
        // 'qr-code': VueQRCodeComponent,
        TimedTooltip,
        DeleteIcon
    },
    props: {
        transactionsReceived: {
            type: Boolean,
            default: false
        },
        isFulfilled: {
            type: Boolean,
            required: true
        },
        isIncoming: {
            type: Boolean,
            required: true
        },
        isReused: {
            type: Boolean,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            default: null
        },
        message: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Number,
            required: true
        },
        address: {
            type: [String, Object],
            required: true
        },
        state: {
            type: String,
            default: 'active'
        }
    },
    data () {
        return {
            showQrCode: false,
            recurring: false
        }
    },

    computed: {
        ...mapGetters({
            getLastSeen: 'PaymentRequest/paymentRequestLastSeen'
        }),

        deleteIconIsVisible () {
            return !this.address.transactions
        },

        qrCodeIsVisible () {
            return !this.received && this.showQrCode
        },

        amountInBaseCoin () {
            return convertToCoin(this.amount)
        },

        getAddress () {
            return this.address.address || this.address
        },

        hasAmountReceived () {
            if (typeof this.address === 'string' || !this.address.total) {
                return false
            }

            return this.address.total.balance >= this.amount
        },

        lastSeen () {
            if (this.address) {
                return this.getLastSeen(this.address.address || this.address)
            }

            return 0
        }
    },

    beforeDestroy () {
        if (this.address) {
            this.setLastSeen({
                id: this.address.address || this.address
            })
        }
    },

    methods: {
        ...mapActions({
            setLastSeen: types.paymentrequest.SET_PAYMENT_REQUEST_LAST_SEEN,
            updateLabel: types.paymentrequest.UPDATE_PAYMENT_REQUEST_LABEL,
            archivePaymentRequest: types.paymentrequest.ARCHIVE_PAYMENT_REQUEST
        }),

        toggleQrCode () {
            this.showQrCode = !this.showQrCode
        },

        onLabelUpdate({ label }) {
            this.updateLabel({
                label,
                createdAt: this.createdAt,
                address: this.getAddress
            })
        },

        tagClicked (tag) {
            this.$router.push({
                name: this.$router.currentRoute.name || 'receive-zcoin-paymentrequest',
                query: {
                    filter: `#${tag}`
                }
            })
        },

        openBlockExplorer (event) {
            event.preventDefault()

            // todo
            alert(`opening ${this.address.address} in block explorer`)
        },

        // Yes, confusing terminology, but imo it makes sense--front end is deleting the payment request, but it's only
        // getting archived on the backend.
        deletePaymentRequest () {
            this.$router.replace({name: 'receive-zcoin'})

            this.archivePaymentRequest(this.getAddress)
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

    // - - - - - - -

    /*
    .create-payment {
        display: block;
        width: 100%;
    }

    .qr-code {
        display: inline-block;
        margin: emRhythm(3) 0 emRhythm(5)
    }

    .qr-toggle {
        display: inline-block;
        cursor: pointer;
        color: $color--polo-medium;
        cursor: pointer;
    }

    .status {
        max-width: emRhythm(25);
        margin: 0 auto;
        opacity: 1;
    }

    header {
        // margin-bottom: emRhythm(4);
        position: relative;

        h1, h2 {
            position: absolute;
            display: grid;
            width: 100%;
            height: 100%;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            align-items: center;
            top: 0;
            margin: 0;

            @include typo-headline();
            mix-blend-mode: multiply;


            i {
                color: $color--comet;
            }
        }

        p {
            @include lato-font('regular', italic);
        }
    }

    $title-width: 25%;

    dl {
        margin: 0 auto emRhythm(5);
        max-width: emRhythm(35);
        text-align: left;
        overflow: hidden;
    }

    dt, dd {
        float: left;
        box-sizing: border-box;
        margin: 0;
    }

    dt {
        @include typo-label();

        clear: both;
        width: $title-width;
        text-align: right;
    }

    dd {
        width: 100% - $title-width;
        padding-left: emRhythm(1);
        padding-bottom: emRhythm(2);
    }

    .message-wrap {
        @include divider-top-with-gradient();
        margin: 0 emRhythm(3);

        p {
            margin: 0 auto;
            max-width: emRhythm(37);
        }
    }
    */
</style>
