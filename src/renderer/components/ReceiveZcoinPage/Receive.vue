<template>
    <div class="receive scrollable-height_">
        <header class="receive-header">
            <div class="inner">
                <span>{{ $d(new Date(createdAt), 'long') }}</span>
                <h2>
                    <natural-language-tags
                        :content="label"
                        tag-size="large"
                        :on-tag-click="tagClicked"
                    />
                </h2>
                <span v-if="amount">
                    {{ amountInBaseCoin }} XZC {{ $t('receive.detail-entry-request.label__requested') }}
                </span>
                <span v-else>
                    {{ $t('receive.detail-entry-request.label__no-amount') }}
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
import { mapActions } from 'vuex'
import { convertToCoin } from '#/lib/convert'

import types from '~/types'

// import VueQRCodeComponent from 'vue-qrcode-component'

import ReceivePendingPaymentRequest from '@/components/ReceiveZcoinPage/ReceivePendingPaymentRequest'
import ReceivePendingPaymentRequestButtons from '@/components/ReceiveZcoinPage/ReceivePendingPaymentRequestButtons'
import ReceiveFulfilledPaymentRequest from '@/components/ReceiveZcoinPage/ReceiveFulfilledPaymentRequest'
import ReceiveFulfilledPaymentRequestButtons from '@/components/ReceiveZcoinPage/ReceiveFulfilledPaymentRequestButtons'

import ReceivePaymentRequestEmailTemplate from '@/components/email/ReceivePaymentEmailTemplate'
import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'
import PaymentRequestStatus from '@/components/Icons/PaymentRequestStatus'
import TimedTooltip from '@/components/Notification/TimedTooltip'
import UnexpectedTransactionPopover from '@/components/ReceiveZcoinPage/UnexpectedTransactionPopover'

export default {
    name: 'ReceivePaymentRequest',
    components: {
        ReceivePendingPaymentRequest,
        ReceivePendingPaymentRequestButtons,
        ReceiveFulfilledPaymentRequest,
        ReceiveFulfilledPaymentRequestButtons,

        UnexpectedTransactionPopover,
        PaymentRequestStatus,
        NaturalLanguageTags,
        ReceivePaymentRequestEmailTemplate,
        // 'qr-code': VueQRCodeComponent,
        TimedTooltip
    },
    props: [
        'transactionsReceived',
        'isFulfilled',
        'isIncoming',
        'isReused',
        'label',
        'amount',
        'message',
        'createdAt',
        'address'
    ],
    data () {
        return {
            showQrCode: false,
            recurring: false
        }
    },

    computed: {
        qrCodeIsVisible () {
            return !this.received && this.showQrCode
        },

        amountInBaseCoin () {
            return convertToCoin(this.amount)
        },

        getZcoinUri () {
            if (!this.address) {
                return ''
            }
            const address = this.address.address || this.address
            const params = []
            params.push(this.amount ? `amount=${this.amount}` : '')
            params.push(this.message ? `message=${encodeURIComponent(this.message)}` : '')
            const paramsString = params.length ? `?${params.join('&')}` : ''

            return `zcoin://${address}${paramsString}`
        },

        hasAmountReceived () {
            if (typeof this.address === 'string' || !this.address.total) {
                return false
            }

            return this.address.total.balance >= this.amount
        }
    },

    beforeDestroy () {
        if (this.address) {
            this.setLastSeen(this.address.address || this.address)
        }
    },
    methods: {
        ...mapActions({
            setLastSeen: types.paymentrequest.SET_PAYMENT_REQUEST_LAST_SEEN
        }),

        toggleQrCode () {
            console.log('toggle qr code')
            this.showQrCode = !this.showQrCode
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
        }
    }
}
</script>

<style lang="scss" scoped>
    .receive {
        @include detail-wrap();
    }

    .receive-header {
        @include detail-header();
    }

    .actions {
        @include detail-actions();
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
