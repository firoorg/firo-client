<template>
    <section class="receive-zcoin">
        <div>
            <section class="paymentrequest-list">
                <h1>
                    Receive<br>
                    Zcoin
                </h1>

                <animated-table :data="this.$store.state.PaymentRequest.requests"
                                :fields="fields"
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
            <router-view v-bind="selectedPaymentRequestWithAddress"
                         :key="$route.fullPath"
                         class="paymentrequest-detail-route"></router-view>
        </section>
    </section>
</template>

<script>
    import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
    import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'

    const fields = [
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
        },

        {
            name: 'gender',
            formatter: (value) => {
                return value === 'M' ? 'Male' : 'Female'
            }
        }
    ]

    export default {
        name: 'ReceiveZcoinPage',
        components: {
            AnimatedTable
        },

        data () {
            return {
                fields,
                selectedPaymentRequest: null
            }
        },

        computed: {
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
                const paymentRequest = this.paymentRequests.filter((request) => {
                    return request.address === this.selectedPaymentRequest
                }).pop()

                console.log(paymentRequest)

                return {
                    ...paymentRequest,
                    address
                }
            },
            paymentRequests () {
                return this.$store.state.PaymentRequest.requests
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

        & > * {
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
</style>