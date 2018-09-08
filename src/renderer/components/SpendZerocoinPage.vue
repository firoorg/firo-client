<template>
    <section class="spend-zerocoin">
        <div class="scrollable-height">
            <section class="payment-list">
                <spend-zerocoin-from-clipboard-popover :boundaries-element="boundariesElement">
                    <h1>
                        Send<br>
                        Zcoin
                    </h1>
                </spend-zerocoin-from-clipboard-popover>

                <div class="table-filter-input-wrap">
                    <base-filter-input type="text"
                                       class="table-filter-input"
                                       v-model="tableFilter"
                                       :placeholder="$t('receive.overview.table__payment-requests.placeholder__filter')" />
                </div>

                <animated-table :data="transactions"
                                :fields="tableFields"
                                track-by="id"
                                :sort-order="[{ field: 'firstSeenAt', direction: 'desc' }]"
                                :selected-row="selectedPaymentRequest"
                                :on-row-select="onTableRowSelect">
                    <template slot="label" scope="props">
                        <natural-language-tags :content="addCategoryTagToLabel(props.rowData)"></natural-language-tags>
                    </template>
                    <!--<template slot="created_at" scope="props">
                        <h1>{{ rowData.name }}</h1>
                    </template>-->
                </animated-table>
            </section>
        </div>
        <section class="payment-detail">
            <spend-zerocoin :boundaries-element="boundariesElement" />
        </section>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    // import { convertToCoin } from '#/lib/convert'
    import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
    import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'
    import Amount from '@/components/AnimatedTable/AnimatedTableAmount'

    import SpendZerocoin from '@/components/SpendZerocoinPage/Spend'

    // import types from '~/types'
    import PaymentRequestTableStatus from '@/components/AnimatedTable/PaymentRequestTableStatus'
    import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'

    import SpendZerocoinFromClipboardPopover from '@/components/SpendZerocoinPage/SpendZerocoinFromClipboardPopover'

    const tableFields = [
        {
            name: PaymentRequestTableStatus,
            isFulfilledKey: 'isConfirmed',
            sortField: 'isConfirmed',
            width: '2rem'
        },
        {
            name: Amount,
            title: 'receive.overview.table__payment-requests.label__amount',
            sortField: 'amount',
            width: '25%'
        },
        {
            name: RelativeDate,
            title: 'Sent',
            dateField: 'firstSeenAt',
            sortField: 'firstSeenAt',
            width: '30%'
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
        name: 'SpendZerocoinPage',
        components: {
            SpendZerocoinFromClipboardPopover,
            AnimatedTable,
            SpendZerocoin,
            NaturalLanguageTags
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
                transactions: 'Address/getOutgoingTransactions',
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

                /*
                this.$router.push({
                    name: 'send-zcoin-paymentrequest',
                    params: {
                        address: this.selectedPaymentRequest
                    }
                })
                */
            },

            addCategoryTagToLabel (rowData) {
                const { label: value, category } = rowData
                const label = value || this.$t('todo__.noLabel')

                if (category === 'send') {
                    return `${label} #${this.$t('todo__.public')}`
                } else if (category === 'spendOut') {
                    return `${label} #${this.$t('todo__.private')}`
                }

                return label
            }
        }
    }
</script>

<style lang="scss" scoped>
    .spend-zerocoin {
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 1fr $detail-view--min-width;
        // background-image: linear-gradient(to top right, $color--dark, $color--comet-dark-mixed);
        //grid-column-gap: emRhythm(5);

        .scrollable {
            position: relative;
            z-index: 1;
            box-sizing: border-box;
            overflow: scroll;
            height: 100vh;
        }
    }

    .payment-list,
    .payment-detail {
        position: relative;
    }

    .payment-list {
        padding: emRhythm(5) emRhythm(4);
    }

    .payment-detail {
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
