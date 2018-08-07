<template>
    <section class="send-zcoin" ref="main">
        <div class="scrollable-height">
            <section class="paymentrequest-list">
                <base-popover
                        :open="showAddressFoundInClipboardPopover"
                        placement="left"
                        popover-class="advice"
                        :boundaries-element="$refs.main"
                        class="pending-payments-popover"
                        trigger="manually"
                >
                    <template slot="target">
                        <h1>
                            Send<br>
                            Zcoin
                        </h1>
                    </template>

                    <template slot="content">
                        <header>
                            <h2>Zcoin Address found</h2>
                        </header>

                        <p>
                            Found a Zcoin address in your clipboard.<br>
                            Would you like to use it as the recipient address to send Zcoin?
                        </p>
                        <div>
                            <footer>
                                <base-button :is-outline="true"
                                             :is-dark="true"
                                             @click.prevent="markAsNotified">
                                    Nope
                                </base-button>
                                <base-button color="green"
                                             :is-dark="true"
                                             @click.prevent="setCurrentFormFields">
                                    Yes, go ahead!
                                </base-button>
                        </footer>
                        </div>

                    </template>
                </base-popover>

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
            <send-zcoin />
        </section>
    </section>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import { convertToCoin } from '#/lib/convert'
    import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
    import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'
    import SendZcoin from '@/components/SendZcoinPage/Send'

    import types from '~/types'

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
            AnimatedTable,
            SendZcoin
        },

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
                clipboardAmount: 'Clipboard/amount',
                clipboardHasNewAddress: 'Clipboard/hasNewAddress',
                currentFormAddress: 'ZcoinPayment/createFormAddress'
            }),

            showAddressFoundInClipboardPopover () {
                return this.clipboardHasNewAddress && this.clipboardAddress !== this.currentFormAddress
            },

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
            ...mapActions({
                setFormAddress: types.zcoinpayment.SET_FORM_ADDRESS,
                setFormAmount: types.zcoinpayment.SET_FORM_AMOUNT,
                markAsNotified: types.clipboard.MARK_AS_NOTIFIED
            }),
            setCurrentFormFields () {
                if (!this.clipboardAddress) {
                    return
                }

                this.setFormAddress(this.clipboardAddress)

                if (this.clipboardAmount) {
                    this.setFormAmount(convertToCoin(this.clipboardAmount))
                }

                this.markAsNotified()
                // this.$store.dispatch(types.zcoinpayment.SET_FORM_ADDRESS, this.clipboardAddress)
                // this.$store.dispatch(types.clipboard.MARK_AS_NOTIFIED)
            },

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