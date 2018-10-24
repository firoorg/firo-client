<template>
    <div>
        <timed-tooltip :is-open="showCopySuccess"
                       popover-class="green"
                       :on-timeout="hideCopySuccess">
            <template slot="content">
                <h3 v-if="showCopyType == 'link'">
                    {{ $t('receive.detail-entry-request.pending.message__copy-link--success') }}
                </h3>
                <h3 v-if="showCopyType == 'address'">
                    {{ $t('receive.detail-entry-request.pending.message__copy-address--success') }}
                </h3>
            </template>
            <base-split-button :is-outline="true">
                <template slot="button" slot-scope="{ button }">
                    <base-button @click="copyUri" v-bind="button">
                        {{ $t('receive.detail-entry-request.pending.button__copy-link--secondary') }}
                    </base-button>
                </template>
                <template slot="flyout">
                    <nav class="menu">
                        <ul>
                            <li>
                                <a href="#" v-close-popover @click.prevent="copyAddress">
                                    {{ $t('receive.detail-entry-request.pending.button__copy-address--secondary') }}
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <!--<base-button :is-dark="true" :is-outline="true">Copy Address</base-button>-->
                    <!--
                    <h3>Copy Address</h3>
                    <p>Copies the address to send Zcoin to only. Try to use is as rarely as possible, almost only when receiving from legacy wallets or external services like exchanges.</p>
                    -->
                </template>
            </base-split-button>
        </timed-tooltip>
        <base-button color="green" @click="shareViaMail">
            {{ $t('receive.detail-entry-request.pending.button__share-via-email--pirmary') }}
        </base-button>

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

    import TimedTooltip from '@/components/Notification/TimedTooltip'
    import ReceivePaymentRequestEmailTemplate from '@/components/email/ReceivePaymentEmailTemplate'

    export default {
        name: 'ReceivePendingPaymentRequestButtons',

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
                showCopySuccess: false,
                showCopyType: ''
            }
        },

        computed: {
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
                this.$electron.shell.openExternal('mailto:?subject=Zcoin Payment Request&body=please select this text and paste the content of your clipboard ;)')
            },

            copyUri () {
                clipboard.writeText(this.getZcoinUri)
                this.showCopySuccess = true
                this.showCopyType = 'link'
            },

            copyAddress () {
                const address = this.address.address || this.address
                clipboard.writeText(address)
                this.showCopySuccess = true
                this.showCopyType = 'address'
            },

            hideCopySuccess () {
                this.showCopySuccess = false
                this.showCopyType = ''
            }
        }
    }
</script>

<style scoped>

</style>
