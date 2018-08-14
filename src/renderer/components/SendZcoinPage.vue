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

                <animated-table :data="paymentRequests"
                                :fields="tableFields"
                                track-by="address"
                                :selected-row="selectedPaymentRequest"
                                :on-row-select="onTableRowSelect">
                    <!--<template slot="created_at" scope="props">
                        <h1>{{ rowData.name }}</h1>
                    </template>-->
                </animated-table>
            </section>
        </div>
        <section class="paymentrequest-detail">
            <send-zcoin :boundaries-element="boundariesElement" />
        </section>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    // import { convertToCoin } from '#/lib/convert'
    import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
    import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'
    import SendZcoin from '@/components/SendZcoinPage/Send'

    // import types from '~/types'
    import SendFromClipboardPopover from '@/components/SendZcoinPage/SendFromClipboardPopover'

    const tableFields = [
        {
            name: 'amount'
        },
        {
            name: RelativeDate,
            title: 'Created',
            dateField: 'created_at',
            sortField: 'created_at'
        },
        {
            name: 'label',
            title: 'Label',
            sortField: 'label'
        }
        /*,
        {
            name: 'gender',
            formatter: (value) => {
                return value === 'M' ? 'Male' : 'Female'
            }
        }
        */
    ]

    export default {
        name: 'sendZcoinPage',
        components: {
            SendFromClipboardPopover,
            AnimatedTable,
            SendZcoin
        },

        props: [
            'boundariesElement'
        ],

        data () {
            return {
                tableFields,
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
            ...mapActions({
                setFormAddress: types.zcoinpayment.SET_FORM_ADDRESS,
                setFormAmount: types.zcoinpayment.SET_FORM_AMOUNT,
                markAsNotified: types.clipboard.MARK_AS_NOTIFIED
            }),
            */

            onTableRowSelect (rowData, index, event) {
                // todo get paymentRequest from store
                this.selectedPaymentRequest = rowData.address

                this.$router.push({
                    name: 'send-zcoin-paymentrequest',
                    params: {
                        address: this.selectedPaymentRequest
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .send-zcoin {
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 3fr  2fr;
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