<template>
    <section class="outgoing-payments">
        <div class="window-height">
            <section
                v-scrollable
                class="outgoing-requests-list"
            >
                <h1>
                    {{ $t('send.public.overview.title') }}
                </h1>

                <outgoing-payments-list
                    :selected-payment="selectedPaymentId"
                    @selection-change="onRowSelect"
                />
            </section>
        </div>
        <section class="paymentrequest-detail">
            <!--<transition
                name="fade"
                mode="out-in"
            >-->
            <router-view
                :key="$route.path"
                class="paymentrequest-detail-route"
            />
            <!--</transition>-->
            <!--<send-zcoin :boundaries-element="boundariesElement" />-->
        </section>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
import FilterByUrlParamMixin from '@/mixins/FilterByUrlParamMixin'
import OutgoingPaymentsList from '@/components/OutgoingPaymentsPage/OutgoingPaymentsList'

export default {
    name: 'OutgoingPaymentsPage',

    components: {
        OutgoingPaymentsList,
    },

    mixins: [
        FilterByUrlParamMixin
    ],

    computed: {
        ...mapGetters({
            transactions: 'Address/getOutgoingTransactions'
        }),

        selectedPaymentId () {
            const { id } = this.$route.params

            return id || null
        }
    },

    methods: {
        onRowSelect ({ name, id }) {
            this.$log.debug(name, id)

            this.pushRouterWithFilter({
                name,
                params: {
                    id
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    .outgoing-payments {
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

    .outgoing-requests-list,
    .paymentrequest-detail {
        position: relative;
    }

    .outgoing-requests-list {
        padding: emRhythm(5) emRhythm(4);
        box-sizing: border-box;
        height: 100%;
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
