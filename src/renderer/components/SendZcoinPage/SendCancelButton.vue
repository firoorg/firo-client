<template>
    <base-button color="green" @click.prevent="actions.next">
        <span v-if="!hasPendingPayments">Send Now</span>
        <span v-else>Send {{ pendingPaymentsSize }} Now</span>
    </base-button>
</template>

<script>
    import { mapGetters } from 'vuex'

    export default {
        name: 'SendCancelButton',

        props: {
            actions: {
                type: Object,
                required: true
            },
            canSubmit: {
                type: Boolean,
                default: false
            }
        },

        computed: {
            ...mapGetters({
                hasPendingPayments: 'ZcoinPayment/hasPendingZcoinPayments',
                pendingPaymentsSize: 'ZcoinPayment/pendingZcoinPaymentsSize'
            })
        }
    }
</script>

<style scoped>

</style>