<template>
    <section class="outgoing-payments">
        <div class="scrollable-height">
            <section class="outgoing-requests-list">
                <send-from-clipboard-popover :boundaries-element="boundariesElement">
                    <h1 v-html="$t('send.public.overview.title')"></h1>
                </send-from-clipboard-popover>

                <outgoing-payments-list :selected-payment="selectedPaymentId"
                                        @selection-change="onRowSelect" />
            </section>
        </div>
        <section class="paymentrequest-detail">
            <transition name="fade" mode="out-in">
                <router-view :key="$route.path"
                             :boundaries-element="boundariesElement"
                             class="paymentrequest-detail-route" />
            </transition>
            <!--<send-zcoin :boundaries-element="boundariesElement" />-->
        </section>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'

    import FilterByUrlParamMixin from '@/mixins/FilterByUrlParamMixin'

    import SendFromClipboardPopover from '@/components/OutgoingPaymentsPage/SendZcoin/SendFromClipboardPopover'
    import OutgoingPaymentsList from '@/components/OutgoingPaymentsPage/OutgoingPaymentsList'

    export default {
        name: 'outgoingPaymentsPage',

        components: {
            OutgoingPaymentsList,
            SendFromClipboardPopover
        },

        mixins: [
            FilterByUrlParamMixin
        ],

        props: [
            'boundariesElement',
            'isPrivate'
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
                console.log(name, id)

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
