<template>
    <div v-show="hasPayments">
        <base-popover
                :disabled="isDisabled"
                :auto-hide="true"
                placement="bottom-end"
                class="pending-payments-popover"
                :boundaries-element="boundariesElement"
        >
            <!-- :trigger="showSendConfirmation ? 'manually' : 'click'" -->
            <template slot="target">
                <base-badge :visible="hasPayments"
                            :count="count">
                    <stack />
                </base-badge>
            </template>

            <template slot="content">
                <header>
                    <h2>Pending Payments</h2>
                    <p>Nulla vitae elit libero, a pharetra augue Integer posuere erat.</p>
                </header>

                <pending-payments :payments="pendingPayments">
                </pending-payments>
            </template>
        </base-popover>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import Stack from '@/components/Icons/Stack'
    import PendingPayments from '@/components/payments/PendingPayments'

    export default {
        name: 'PendingZcoinPaymentsQueue',

        components: {
            Stack,
            PendingPayments
        },

        props: {
            isDisabled: {
                type: Boolean,
                required: true
            },
            boundariesElement: {
                required: true
            }
        },

        computed: {
            ...mapGetters({
                pendingPayments: 'ZcoinPayment/pendingZcoinPayments',
                hasPayments: 'ZcoinPayment/hasPendingZcoinPayments',
                count: 'ZcoinPayment/pendingZcoinPaymentsSize'
            })
        }
    }
</script>

<style scoped>

</style>