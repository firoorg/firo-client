<template>
    <section class="receive-zcoin">
        <div class="scrollable-height">
            <section class="paymentrequest-list">
                <h1>
                    Receive<br>
                    Zcoin
                </h1>

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
                             :key="$route.fullPath"
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

    const tableFields = [
        {
            name: PaymentRequestTableStatus,
            sortField: 'isFulfilled'
        },
        {
            name: RelativeDate,
            title: 'Created',
            dateField: 'created_at',
            sortField: 'created_at'
        },
        {
            name: LabelWithHashTags,
            title: 'Label',
            sortField: 'label',
            contentField: 'label'
        },
        {
            name: 'amount',
            sortField: 'amount'
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

                console.log(paymentRequest)

                return {
                    ...paymentRequest,
                    address
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
</style>