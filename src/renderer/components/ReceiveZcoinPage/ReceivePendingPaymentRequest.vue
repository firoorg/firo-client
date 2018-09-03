<template>
    <div class="is-pending">
        <div class="message-wrap">
            <h2>Message</h2>
            <div v-html="messageFormatted" />
        </div>
        <div class="actions">
            <timed-tooltip :is-open="showCopySuccess"
                           popover-class="green"
                           :on-timeout="hideCopySuccess">
                <template slot="content">
                    <h3>
                        {{ $t('receive.detail-entry-request.pending.message__copy-link--success') }}
                    </h3>
                </template>
                <base-button :is-outline="true" @click="copyUri">
                    {{ $t('receive.detail-entry-request.pending.button__copy-link--secondary') }}
                </base-button>
            </timed-tooltip>
            <base-button color="green" @click="shareViaMail">
                {{ $t('receive.detail-entry-request.pending.button__share-via-email--pirmary') }}
            </base-button>
        </div>

        <!-- E-Mail Template -->
        <div style="position: absolute; top:0;left:0;height:0;width:0;overflow: hidden">
            <receive-payment-request-email-template
                    :message="message"
                    :amount="amountInBaseCoin"
                    :uri="getZcoinUri"
                    ref="emailTemplate">
                <template slot="qrcode">
                    <h1>qr code</h1>
                    <!--<qr-code :text="getZcoinUri"
                             :size="128"
                             color="#1F1F2E"
                             bg-color="#ffffff">
                    </qr-code>-->
                </template>
            </receive-payment-request-email-template>
        </div>
    </div>
</template>

<script>
    import { clipboard } from 'electron'
    import { convertToCoin } from '#/lib/convert'
    import { nl2br } from '@/utils/format'

    import TimedTooltip from '@/components/Notification/TimedTooltip'
    import ReceivePaymentRequestEmailTemplate from '@/components/email/ReceivePaymentEmailTemplate'

    export default {
        name: 'ReceivePendingPaymentRequest',

        components: {
            TimedTooltip,
            ReceivePaymentRequestEmailTemplate
        },

        props: [
            'address',
            'amount',
            'message'
        ],

        data () {
            return {
                showCopySuccess: false
            }
        },

        computed: {
            messageFormatted () {
                return nl2br(this.message)
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
            }
        },

        methods: {
            shareViaMail () {
                clipboard.writeHTML(this.$refs.emailTemplate.$el.innerHTML)
                this.$electron.shell.openExternal('mailto:?subject=Zcoin Payment Request&body=please select this text and press cmd+v ;)')
            },

            copyUri () {
                console.log('coping to clipboard', this.getZcoinUri)
                clipboard.writeText(this.getZcoinUri)
                this.showCopySuccess = true
            },

            hideCopySuccess () {
                this.showCopySuccess = false
            }
        }
    }
</script>

<style lang="scss" scoped>
    .is-pending {
        display: grid;
        grid-template-rows: 1fr auto;

        h2 {
            @include font-black();
            @include setType(2, $ms-up1);
        }

        .message-wrap {
            margin-left: emRhythm(3);
        }

        .actions {
            @include divider-top-with-gradient();
            padding-bottom: 0;
            display: flex;
            justify-content: center;

            button + button,
            .popover + button {
                margin-left: emRhythm(2);
            }
        }
    }
</style>
