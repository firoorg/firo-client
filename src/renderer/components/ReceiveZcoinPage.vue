<template>
    <section class="receive-zcoin">
        <div class="window-height">
            <section
                v-scrollable
                class="paymentrequest-list"
            >
                <div class="section-header">
                    <h1 v-html="$t('receive.overview.title')" />

                    <base-filter-input
                        v-model="urlFilter"
                        type="text"
                        class="table-filter-input"
                        :placeholder="$t('receive.overview.table__payment-requests.placeholder__filter')"
                    />
                </div>

                <notice
                    v-if="hasUnseenPaymentRequests"
                    class="has-unseen-changes"
                >
                    <header>
                        <h3>
                            {{ $tc('receive.overview.notice__unseen-payments.title', paymentRequestsWithUnseenChanges.length) }}
                        </h3>
                    </header>

                    <main>
                        <p v-html="$tc('receive.overview.notice__unseen-payments.description', paymentRequestsWithUnseenChanges.length, { count: paymentRequestsWithUnseenChanges.length })" />

                        <ul>
                            <li
                                v-for="f of paymentRequestsWithUnseenChanges"
                                :key="f.id"
                            >
                                <router-link :to="getDetailRouteForAddress(f.address)">
                                    {{ f.label }}
                                </router-link>
                            </li>
                        </ul>
                    </main>
                </notice>

                <animated-table
                    :data="filteredPaymentRequests"
                    :fields="tableFields"
                    track-by="address"
                    :no-data-message="getNoDataMessage"
                    :selected-row="selectedPaymentRequest"
                    :on-row-select="onTableRowSelect"
                    class="payment-requests-table"
                    :sort-order="sortOrder"
                >
                    <!--<template slot="created_at" scope="props">
                        <h1>{{ rowData.name }}</h1>
                    </template>-->
                </animated-table>

                <transition name="fade">
                    <onboarding-notice
                        v-if="allPaymentRequestsLength < 1"
                        class="onboarding"
                    >
                        <template slot="header">
                            <h3 v-html="$t('onboarding.on-request.title')" />
                        </template>
                        <template slot="content">
                            <p v-html="$t('onboarding.on-request.description')" />
                        </template>
                    </onboarding-notice>
                </transition>
            </section>
        </div>
        <section class="paymentrequest-detail">
            <transition name="fade">
                <div
                    v-if="$route.name != 'receive-zcoin'"
                    class="fixed-button-detail-top-wrap"
                >
                    <base-button
                        color="comet"
                        class="create-payment-request"
                        @click="$router.push({ name: 'receive-zcoin' })"
                    >
                        {{ $t('receive.detail-entry-request.button__primary-action') }}
                    </base-button>
                </div>
            </transition>
            <!--<transition
                name="fade"
                mode="out-in"
            >-->
            <router-view
                :key="$route.path"
                v-bind="selectedPaymentRequestWithAddress"
                class="paymentrequest-detail-route"
                @route-to-detail="onRouteToDetail"
            />
            <!--</transition>-->
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
import ReceivedAmount from '@/components/AnimatedTable/AnimatedTableReceivedAmount'
import OnboardingNotice from '@/components/Notification/OnboardingNotice'
import Notice from '@/components/Notification/Notice'

const tableFields = [
    {
        name: PaymentRequestTableStatus,
        sortField: 'isFulfilled',
        width: '2rem'
    },
    {
        name: RelativeDate,
        title: 'receive.overview.table__payment-requests.label__lastUpdate',
        dateField: 'updatedAt',
        sortField: 'updatedAt',
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
        name: ReceivedAmount,
        title: 'receive.overview.table__payment-requests.label__amount',
        sortField: 'amountReceived',
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
        OnboardingNotice,
        Notice,
        AnimatedTable
    },

    mixins: [
        FilterByUrlParamMixin
    ],

    data () {
        return {
            tableFields
            //selectedPaymentRequest: null
        }
    },

    computed: {
        ...mapGetters({
            paymentRequests: 'PaymentRequest/paymentRequests',
            virtualPaymentRequests: 'PaymentRequest/virtualPaymentRequests',
            allPaymentRequests: 'PaymentRequest/allPaymentRequests',
            hasUnseenPaymentRequests: 'PaymentRequest/hasUnseenPaymentRequests',
            paymentRequestsWithUnseenChanges: 'PaymentRequest/paymentRequestsWithUnseenChanges',
            walletAddresses: 'Address/walletAddresses'
        }),

        selectedPaymentRequest () {
            return this.$route.params.address
        },

        selectedPaymentRequestWithAddress () {
            if (!this.selectedPaymentRequest) {
                return null
            }

            const filteredAddress = this.walletAddresses.find((address) => {
                return address.address === this.selectedPaymentRequest
            })

            const paymentRequest = this.allPaymentRequests.find((request) => {
                return request.address === this.selectedPaymentRequest
            })

            const address = filteredAddress || paymentRequest.address

            return {
                ...paymentRequest,
                address
            }
        },

        filteredPaymentRequests () {
            return this.getFilteredByUrl(this.allPaymentRequests, ['label', 'address'])
        },

        allPaymentRequestsLength () {
            return this.allPaymentRequests.length
        },

        getNoDataMessage () {
            return this.allPaymentRequestsLength ? 'No Payment Requests found' : 'No Payment Requests created'
        },

        sortOrder () {
            return [
                {
                    sortField: 'updatedAt',
                    direction: 'desc'
                }
            ]
        }
    },

    methods: {
        onRouteToDetail ({ address }) {
            this.pushRouterWithFilter({
                name: 'receive-zcoin-paymentrequest',
                params: {
                    address
                }
            })
        },

        onTableRowSelect (rowData, index, event) {
            // todo get paymentRequest from store
            const { address } = rowData

            // remove selection
            if (this.selectedPaymentRequest === address || this.selectedPaymentRequest === address) {

                this.pushRouterWithFilter({
                    name: 'receive-zcoin'
                })
                return
            }

            this.pushRouterWithFilter({
                name: 'receive-zcoin-paymentrequest',
                params: {
                    address
                }
            })
        },

        getDetailRouteForAddress (address) {
            return this.getRouterWithFilter({
                name: 'receive-zcoin-paymentrequest',
                params: {
                    address
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
        //grid-column-gap: emRhythm($scrollbar-padding, $silent: true);

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: emRhythm(7);

            h1 {
                margin-bottom: 0;
            }
        }
    }

    .paymentrequest-list,
    .paymentrequest-detail {
        position: relative;
    }

    .paymentrequest-list {
        height: 100%;
        box-sizing: border-box;
    }

    .paymentrequest-list {
        padding: emRhythm(5) emRhythm(4) emRhythm(5) emRhythm(4);
    }

    .payment-requests-table + .onboarding {
        margin-top: emRhythm(8);
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
        //max-height: 100vh;
        box-sizing: border-box;
    }

    .table-filter-input-wrap {
        text-align: right;
        margin-top: emRhythm(3) * -1;
        margin-bottom: emRhythm(5);
    }

    .table-filter-input {
        width: 45%;
    }

    .has-unseen-changes {
        //border: 1px solid $color--green;
        //@include glow-huge-box($color--green-dark);
        background: $color--green;
        color: $color--white;
        padding: emRhythm(1) emRhythm(4) emRhythm(2);
        margin: 0 0 emRhythm(4);

        header {
            font-style: normal;
        }

        a {
            color: $color--white;
            @include font-medium();
        }
    }
</style>
