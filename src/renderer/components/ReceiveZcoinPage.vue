<template>
    <section class="receive-zcoin">
        <div class="scrollable-height">
            <section class="paymentrequest-list">
                <h1>
                    Receive<br>
                    Zcoin
                </h1>

                <div class="table-filter-input-wrap">
                    <base-filter-input type="text"
                                       class="table-filter-input"
                                       v-model="tableFilter"
                                       placeholder="Filter by label" />
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
                        Create Payment Request
                    </base-button>
                </div>
            </transition>
            <transition name="fade" mode="out-in">
                <router-view v-bind="selectedPaymentRequestWithAddress"
                             :key="$route.path"
                             class="paymentrequest-detail-route scrollable"></router-view>
            </transition>
        </section>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
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
            title: 'Created',
            dateField: 'createdAt',
            sortField: 'createdAt',
            width: '30%'
        },
        {
            name: LabelWithHashTags,
            title: 'Label',
            sortField: 'label',
            contentField: 'label',
            width: '50%'
        },
        {
            name: Amount,
            title: 'Amount',
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

        data () {
            return {
                tableFields,
                selectedPaymentRequest: null
            }
        },

        computed: {
            ...mapGetters({
                paymentRequests: 'PaymentRequest/paymentRequests',
                walletAddresses: 'Address/walletAddresses'
            }),

            selectedPaymentRequestWithAddress () {
                if (!this.selectedPaymentRequest) {
                    return null
                }

                const filteredAddress = this.walletAddresses.filter((address) => {
                    return address.address === this.selectedPaymentRequest
                })

                console.log(filteredAddress)

                const [ paymentRequest ] = this.paymentRequests.filter((request) => {
                    return request.address === this.selectedPaymentRequest
                })

                const address = filteredAddress.length ? filteredAddress[0] : paymentRequest.address

                return {
                    ...paymentRequest,
                    address
                }
            },

            filteredPaymentRequests () {
                if (!this.tableFilter) {
                    return this.paymentRequests
                }

                return this.paymentRequests.filter((request) => {
                    return request.label ? request.label.includes(this.tableFilter) : false
                })
            },

            tableFilter: {
                get () {
                    try {
                        const { filter } = this.$store.state.AppRouter.query

                        return filter
                    } catch (e) {
                        console.error(e)
                        return ''
                    }
                },

                set (newValue) {
                    const route = {
                        name: this.$router.currentRoute.name
                    }

                    if (!newValue) {
                        this.$router.replace(route)
                        return
                    }

                    this.$router.replace({
                        ...route,
                        query: {
                            filter: newValue
                        }
                    })
                }
            }
        },

        methods: {
            onTableRowSelect (rowData, index, event) {
                // todo get paymentRequest from store
                this.selectedPaymentRequest = rowData.address

                this.$router.push({
                    name: 'receive-zcoin-paymentrequest',
                    params: {
                        address: this.selectedPaymentRequest
                    },
                    query: {
                        filter: this.tableFilter
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
        grid-template-columns: 3fr  2fr;
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

    .table-filter-input-wrap {
        text-align: right;
        margin-top: emRhythm(3) * -1;
        margin-bottom: emRhythm(5);

        .table-filter-input {
            width: 45%;
        }
    }
</style>