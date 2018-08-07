<template>
        <section class="receive scrollable-height">
            <div class="info-wrap">
                <qr-code class="qr-code"
                         v-show="qrCodeIsVisible"
                         :text="getZcoinUri"
                         :size="128"
                         color="#1F1F2E"
                         bg-color="rgba(0,0,0,0)">
                </qr-code>
                <header>
                    <div class="status"
                         v-show="!qrCodeIsVisible"
                         :class="{ 'is-fulfilled': isFulfilled }">
                        <payment-request-status :is-fulfilled="isFulfilled" />
                    </div>
                    <h2>
                        <natural-language-tags :content="label" tag-size="large" :onTagClick="tagClicked" />
                        <i v-if="!isFulfilled" class="qr-toggle el-icon-menu" @click="toggleQrCode"></i>
                    </h2>
                </header>

                <dl>
                    <dt>Created</dt>
                    <dd><timeago :datetime="createdAt" :auto-update="30"></timeago></dd>
                    <dt>Amount</dt>
                    <dd>{{ amount ? amountInBaseCoin + ' XZC' : 'No Amount Requested' }}</dd>
                </dl>
            </div>

            <div class="message-wrap" v-if="message">
                <p>{{ message }}</p>
            </div>
            <div v-else></div>

            <div class="action-wrap">
                <div v-if="isFulfilled">
                    <base-button @click.prevent="openBlockExplorer">Open in Block Explorer</base-button>
                </div>
                <div v-else>
                    <timed-tooltip :is-open="showCopySuccess"
                                   popover-class="green"
                                   :on-timeout="hideCopySuccess">
                        <template slot="content">
                            <h3>Copied Link to your clipboard</h3>
                        </template>
                        <base-button :is-outline="true" @click="copyUri">Copy Link</base-button>
                    </timed-tooltip>
                    <base-button color="green" @click="shareViaMail">Share via E-Mail</base-button>
                </div>

                <!-- E-Mail Template -->
                <div style="position: absolute; top:0;left:0;height:0;width:0;overflow: hidden">
                    <receive-payment-request-email-template
                            :message="message"
                            :amount="amountInBaseCoin"
                            :uri="getZcoinUri"
                            ref="emailTemplate">
                        <template slot="qrcode">
                            <qr-code :text="getZcoinUri"
                                     :size="128"
                                     color="#1F1F2E"
                                     bg-color="#ffffff">
                            </qr-code>
                        </template>
                    </receive-payment-request-email-template>
                </div>
            </div>
        </section>
</template>

<script>
    import { clipboard } from 'electron'
    import VueQRCodeComponent from 'vue-qrcode-component'
    import ReceivePaymentRequestEmailTemplate from '@/components/email/ReceivePaymentEmailTemplate'
    import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'
    import PaymentRequestStatus from '@/components/Icons/PaymentRequestStatus'
    import TimedTooltip from '@/components/Notification/TimedTooltip'
    import { convertToCoin } from '#/lib/convert'

    export default {
        name: 'receivePaymentRequest',
        components: {
            PaymentRequestStatus,
            NaturalLanguageTags,
            ReceivePaymentRequestEmailTemplate,
            'qr-code': VueQRCodeComponent,
            TimedTooltip
        },
        props: [
            'isFulfilled',
            'label',
            'amount',
            'message',
            'createdAt',
            'address'
        ],
        data () {
            return {
                showQrCode: false,
                recurring: false,
                showCopySuccess: false
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
            }
        },
        methods: {
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

            shareViaMail () {
                clipboard.writeHTML(this.$refs.emailTemplate.$el.innerHTML)
                this.$electron.shell.openExternal('mailto:?subject=Zcoin Payment Request&body=please select this text and press cmd+v ;)')
            },

            copyUri () {
                clipboard.writeText(this.getZcoinUri)
                this.showCopySuccess = true
            },

            hideCopySuccess () {
                this.showCopySuccess = false
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
        background: $color--white;
        padding: emRhythm(10) emRhythm(5) emRhythm(5);
        text-align: center;
        min-height: 100%;
        box-sizing: border-box;
        color: $color--dark;

        display: grid;
        grid-template-rows: auto 1fr auto;
    }

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
</style>
