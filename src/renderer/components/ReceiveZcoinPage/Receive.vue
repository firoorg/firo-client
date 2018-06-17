<template>
    <transition name="fade">
        <section class="receive">
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
                         :class="{ received: received }">
                        <PaymentRequestStatus :received="received" />
                    </div>
                    <h2>
                        <NaturalLanguageTags :content="label" tag-size="large" :onTagClick="tagClicked" />
                        <i v-if="!received" class="qr-toggle el-icon-menu" @click="toggleQrCode"></i>
                    </h2>
                </header>

                <dl>
                    <dt>Created</dt>
                    <dd><timeago :since="created_at" :auto-update="30"></timeago></dd>
                    <dt>Amount Received</dt>
                    <dd>{{ amountRequested ? amountRequested : 'No Amount Requested' }}</dd>
                </dl>
            </div>

            <div class="message-wrap" v-show="message">
                <p>{{ message }}</p>
            </div>

            <div class="action-wrap">
                <div v-if="received">
                    <!--<el-button plain>Mark as Recurring</el-button>-->
                    <BaseButton>Open in Block Explorer</BaseButton>
                </div>
                <div v-else-if="!received">
                    <BaseButton @click="() => received = !received">Copy Link</BaseButton>
                    <BaseButton color="green" @click="shareViaMail">Share via E-Mail</BaseButton>
                </div>

                <!-- E-Mail Template -->
                <div style="position: absolute; top:0;left:0;height:0;width:0;overflow: hidden">
                    <!--
                    <receive-payment-request-email-template
                            :message="message"
                            :amount="amountRequested"
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
                    -->
                </div>
            </div>
        </section>
    </transition>
</template>

<script>
  import { clipboard } from 'electron'
  import VueQRCodeComponent from 'vue-qrcode-component'
  import ReceivePaymentRequestEmailTemplate from '@/components/email/ReceivePaymentEmailTemplate'
  import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'
  import PaymentRequestStatus from '@/components/Icons/PaymentRequestStatus'

  export default {
      name: 'receivePaymentRequest',
      components: {
          PaymentRequestStatus,
          NaturalLanguageTags,
          ReceivePaymentRequestEmailTemplate,
          'qr-code': VueQRCodeComponent
      },
      props: [
          'received',
          'label',
          'amountRequested',
          'message',
          'created_at',
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

          getZcoinUri () {
              const address = this.address ? this.address.address : ''

              return `zcoin://${address}`
          }
      },
      methods: {
          toggleQrCode () {
              console.log('toggle qr code')
              this.showQrCode = !this.showQrCode
          },

          tagClicked (tag) {
              console.log('tag clicked -->', tag)
              console.log('todo: redirecting to the filtered list page')
          },

          shareViaMail () {
              // clipboard.writeHTML('<h1>Hello</h1><a href="#">World</a><img src="data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7" />')
              console.log(this.$refs.emailTemplate.$el.innerHTML)
              clipboard.writeHTML(this.$refs.emailTemplate.$el.innerHTML)
              this.$electron.shell.openExternal('mailto:?subject=Zcoin Payment Request&body=please select this text and press cmd+v ;)')
          }
      }
  }
</script>

<style lang="scss" scoped>
    @import '../../styles';

    .receive {
        background: $color--white;
        padding: emRhythm(15) emRhythm(5) emRhythm(5);
        text-align: center;
        min-height: 100%;
        box-sizing: border-box;
        color: $color--dark;

        display: grid;
        // info: auto; message: 1fr; actions: auto;
        grid-template-rows: auto 1fr auto;
        /*grid-template-areas:
                'info'
                'message'
                'actions';
                */

        /*
        .info-wrap {
            grid-area: info;
        }
        .message-wrap {
            grid-area: message;
        }
        .action-wrap {
            grid-area: actions;
        }
        */
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
        text-align: center;
        font-size: emRhythm(18);
        color: $color--comet;

        i {
            @include glow-huge-icon($color--comet-dark);
            @include color-gradient($gradient--comet-dark-horizontal);
            font-weight: bold;
        }

        &.received i {
            @include glow-huge-icon($color--green);
            background-image: $gradient--green-bright;
        }
    }

    header {
        margin-bottom: emRhythm(4);
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
            margin-bottom: 0;

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
        max-width: 25rem;
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
        border-top: 1px solid $color--polo-medium;
        background: radial-gradient(at top, rgba($color--comet-light, 0.35), rgba($color--comet-light, 0) 70%);
        min-height: 10rem;
        padding-bottom: emRhythm(5);
        @include rhythmBorderTop(1px, 5);
        margin: 0 emRhythm(3);

        p {
            margin: 0 auto;
            max-width: emRhythm(37);
        }
    }
</style>