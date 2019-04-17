<template>
    <div class="receive-pending-payment-request-buttons">
        <timed-tooltip
            :is-open="showCopySuccess"
            popover-class="green"
            :on-timeout="hideCopySuccess"
        >
            <template slot="content">
                <h3 v-if="showCopyType == 'link'">
                    {{ $t('receive.detail-entry-request.pending.message__copy-link--success') }}
                </h3>
                <h3 v-if="showCopyType == 'address'">
                    {{ $t('receive.detail-entry-request.pending.message__copy-address--success') }}
                </h3>
            </template>
            <base-split-button :is-outline="true">
                <template
                    slot="button"
                    slot-scope="{ button }"
                >
                    <base-button
                        v-bind="button"
                        @click="copyAddress"
                    >
                        {{ $t('receive.detail-entry-request.pending.button__copy-address--secondary') }}
                    </base-button>
                </template>
                <template slot="flyout">
                    <nav class="menu">
                        <ul>
                            <li>
                                <a
                                    v-close-popover
                                    href="#"
                                    @click.prevent="copyUri"
                                >
                                    {{ $t('receive.detail-entry-request.pending.button__copy-link--secondary') }}
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
        <base-button
            color="green"
            @click="shareViaMail"
        >
            {{ $t('receive.detail-entry-request.pending.button__share-via-email--pirmary') }}
        </base-button>

        <!-- E-Mail Template -->
        <div style="position: absolute; top:0;left:0;height:0;width:0;overflow: hidden">
            <receive-payment-request-email-template
                ref="emailTemplate"
                :message="message || ''"
                :address="getAddress"
                :amount="amountInBaseCoin"
                :uri="getZcoinUri"
            >
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

    props: {
        address: {
            type: [Object, String],
            required: true
        },
        amount: {
            type: Number,
            default: 0
        },
        message: {
            type: String,
            default: ''
        }
    },

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

        getAddress () {
            if (!this.address) {
                return ''
            }
            return this.address.address || this.address
        },

        getZcoinUri () {
            const address = this.getAddress

            if (!address) {
                return ''
            }

            const params = []

            if (this.amount) {
                params.push(`amount=${this.amount}`)
            }

            if (this.message) {
                params.push(`message=${encodeURIComponent(this.message)}`)
            }

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

<style scoped lang="scss">
    .receive-pending-payment-request-buttons {
        // Without this directive, the buttons will be too large and will be displayed on two lines.
        font-size: 0.9em;
    }
</style>
