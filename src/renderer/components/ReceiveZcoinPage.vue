<template>
    <section class="receive-zcoin">
        <div class="scrollable">
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
                <div class="create-wrap" v-if="$route.name != 'receive-zcoin'">
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
    import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'

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
                paymentRequests: 'PaymentRequest/paymentRequests'
            }),

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