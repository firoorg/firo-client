<template>
    <section class="receive-zcoin">
        <div class="scrollable-height">
            <section class="paymentrequest-list">
                <h1 v-html="$t('receive.overview.title')"></h1>

                <div class="table-filter-input-wrap">
                    <base-filter-input type="text"
                                       class="table-filter-input"
                                       v-model="urlFilter"
                                       :placeholder="$t('receive.overview.table__payment-requests.placeholder__filter')" />
                </div>

                <animated-table :data="filteredPaymentRequests"
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
            <transition name="fade">
                <div class="fixed-button-detail-top-wrap" v-if="$route.name != 'receive-zcoin'">
                    <base-button color="comet"
                                 class="create-payment-request" @click="$router.push({ name: 'receive-zcoin' })">
                        {{ $t('receive.detail-entry-request.button__primary-action') }}
                    </base-button>
                </div>
            </transition>
            <transition name="fade" mode="out-in">
                <router-view v-bind="selectedPaymentRequestWithAddress"
                             :key="$route.path"
                             class="paymentrequest-detail-route"></router-view>
            </transition>
        </section>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'

    import FilterByUrlParamMixin from '@/mixins/FilterByUrlParamMixin'

    import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
    import PaymentRequestTableStatus from '@/components/AnimatedTable/PaymentRequestTableStatus'
    import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'
    import LabelWithHashTags from '@/components/AnimatedTable/AnimatedTableLabelWithHashTags'
    import Amount from '@/components/AnimatedTable/AnimatedTableAmount'

    const tableFields = [
        {
            name: PaymentRequestTableStatus,
            sortField: 'isFulfilled',
            width: '2rem'
        },
        {
            name: RelativeDate,
            title: 'receive.overview.table__payment-requests.label__created',
            dateField: 'createdAt',
            sortField: 'createdAt',
            width: '30%'
        },
        {
            name: LabelWithHashTags,
            title: 'receive.overview.table__payment-requests.label__label',
            sortField: 'label',
            contentField: 'label',
            width: '50%'
        },
        {
            name: Amount,
            title: 'receive.overview.table__payment-requests.label__amount',
            sortField: 'amount',
            width: '25%'
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
        name: 'ReceiveZcoinPage',
        components: {
            AnimatedTable
        },

        mixins: [
            FilterByUrlParamMixin
        ],

        data () {
            return {
                tableFields,
                selectedPaymentRequest: null
            }
        },

        computed: {
            ...mapGetters({
                paymentRequests: 'PaymentRequest/paymentRequests',
                virtualPaymentRequests: 'PaymentRequest/virtualPaymentRequests',
                walletAddresses: 'Address/walletAddresses'
            }),

            selectedPaymentRequestWithAddress () {
                if (!this.selectedPaymentRequest) {
                    return null
                }

                const filteredAddress = this.walletAddresses.find((address) => {
                    return address.address === this.selectedPaymentRequest
                })

                console.log(filteredAddress)

                const paymentRequest = this.allPaymentRequests.find((request) => {
                    return request.address === this.selectedPaymentRequest
                })

                const address = filteredAddress || paymentRequest.address

                return {
                    ...paymentRequest,
                    address
                }
            },

            allPaymentRequests () {
                return [
                    ...this.paymentRequests,
                    ...this.virtualPaymentRequests
                ]
            },

            filteredPaymentRequests () {
                console.log(this.virtualPaymentRequests)
                return this.getFilteredByUrl(this.allPaymentRequests, 'label')
            }
        },

        methods: {
            onTableRowSelect (rowData, index, event) {
                // todo get paymentRequest from store
                this.selectedPaymentRequest = rowData.address

                this.pushRouterWithFilter({
                    name: 'receive-zcoin-paymentrequest',
                    params: {
                        address: this.selectedPaymentRequest
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .receive-zcoin {
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 1fr 30rem;
        grid-column-gap: emRhythm($scrollbar-padding, $silent: true);
    }

    .paymentrequest-list,
    .paymentrequest-detail {
        position: relative;
    }

    .paymentrequest-list {
        padding: emRhythm(5) emRhythm(3) emRhythm(5) emRhythm(4);
    }

    .receive-zcoin > .scrollable-height {
        @include scrollbar-on-hover();
    }

    .create-payment-request {
        cursor: pointer;
    }

    .paymentrequest-detail {
        //background: $gradient--comet-dark-horizontal;
        //background: $gradient--polo-horizontal;
        background: $color--white;
    }

    .paymentrequest-detail-route {
        max-height: 100vh;
        box-sizing: border-box;
    }

    .table-filter-input-wrap {
        text-align: right;
        margin-top: emRhythm(3) * -1;
        margin-bottom: emRhythm(5);

        .table-filter-input {
            width: 45%;
        }
    }
</style>
