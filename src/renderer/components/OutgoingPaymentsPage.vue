<template>
    <section class="outgoing-payments">
        <div class="scrollable-height">
            <section class="outgoing-requests-list">
                <component
                    :is="fromClipboardPopoverName"
                    @update-form="onFormUpdateFromClipboardPopover"
                >
                    <h1 v-html="$t('send.public.overview.title')" />
                </component>

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

import SendFromClipboardPopover from '@/components/OutgoingPaymentsPage/SendZcoin/SendFromClipboardPopover'
import SpendZerocoinFromClipboardPopover from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinFromClipboardPopover'
import OutgoingPaymentsList from '@/components/OutgoingPaymentsPage/OutgoingPaymentsList'

export default {
    name: 'OutgoingPaymentsPage',

    components: {
        OutgoingPaymentsList,
        SendFromClipboardPopover,
        SpendZerocoinFromClipboardPopover
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
        },

        fromClipboardPopoverName () {
            const prefix = this.$route.meta.isPublic ? 'Send' : 'SpendZerocoin'

            return `${prefix}FromClipboardPopover`
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
        },
        onFormUpdateFromClipboardPopover (event) {
            const { name } = event

            this.pushRouterWithFilter({
                name
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
