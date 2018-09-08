<template>
    <section class="send-zcoin">
        <div class="scrollable-height">
            <section class="paymentrequest-list">
                <send-from-clipboard-popover :boundaries-element="boundariesElement">
                    <h1>
                        Send<br>
                        Zcoin
                    </h1>
                </send-from-clipboard-popover>

                <outgoing-payments-list />
            </section>
        </div>
        <section class="paymentrequest-detail">
            <send-zcoin :boundaries-element="boundariesElement" />
        </section>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import SendZcoin from '@/components/SendZcoinPage/Send'

    import SendFromClipboardPopover from '@/components/SendZcoinPage/SendFromClipboardPopover'
    import OutgoingPaymentsList from '@/components/payments/OutgoingPaymentsList'

    export default {
        name: 'sendZcoinPage',
        components: {
            OutgoingPaymentsList,
            SendFromClipboardPopover,
            SendZcoin
        },

        props: [
            'boundariesElement'
        ],

        data () {
            return {
                selectedPaymentRequest: null
            }
        },

        beforeDestroy () {
            // console.log('mark as notified!')
            // this.$store.dispatch(types.clipboard.MARK_AS_NOTIFIED)
        },

        computed: {
            ...mapGetters({
                paymentRequests: 'PaymentRequest/paymentRequests',
                clipboardNotified: 'Clipboard/isNotified',
                clipboardAddress: 'Clipboard/address',
                clipboardAmount: 'Clipboard/amount'
            }),

            /*
            showAddressFoundInClipboardPopover () {
                return this.clipboardHasNewAddress && this.clipboardAddress !== this.currentFormAddress
            },
            */

            selectedPaymentRequestWithAddress () {
                if (!this.selectedPaymentRequest) {
                    return null
                }

                // console.log(this.$store.state.Address.addresses)
                const getter = this.$store.state.Address.addresses
                // const getter = this.$store.state['Zcoin/addresses']

                const filteredAddress = getter.filter((address) => {
                    return address.address === this.selectedPaymentRequest
                })

                console.log(filteredAddress)

                const address = filteredAddress.length ? filteredAddress[0] : null
                const [ paymentRequest ] = this.paymentRequests.filter((request) => {
                    return request.address === this.selectedPaymentRequest
                })

                console.log(paymentRequest)

                return {
                    ...paymentRequest,
                    address
                }
            }
        },

        methods: {
            /*
            onTableRowSelect (rowData, index, event) {
                // todo get paymentRequest from store
                this.selectedPaymentRequest = rowData.address

                this.pushRouterWithFilter({
                    name: 'send-zcoin-paymentrequest',
                    params: {
                        address: this.selectedPaymentRequest
                    }
                })
            }
            */
        }
    }
</script>

<style lang="scss" scoped>
    .send-zcoin {
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 1fr $detail-view--min-width;
        //grid-column-gap: emRhythm(5);

        .scrollable {
            position: relative;
            z-index: 1;
            box-sizing: border-box;
            overflow: scroll;
            height: 100vh;
        }
    }

    .paymentrequest-list,
    .paymentrequest-detail {
        position: relative;
    }

    .paymentrequest-list {
        padding: emRhythm(5) emRhythm(4);
    }

    .paymentrequest-detail {
        //background: $gradient--comet-dark-horizontal;
        //background: $gradient--polo-horizontal;
        background: $color--white;
    }

    .create-wrap {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        width: 100%;

        .create-payment-request {
            width: 100%;
        }
    }
</style>
