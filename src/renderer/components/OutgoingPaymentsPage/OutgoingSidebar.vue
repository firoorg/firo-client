<template>
    <router-view
        v-bind="selectedPayment"
        :boundaries-element="boundariesElement"
    />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'OutgoingSidebar',

    props: [
        'boundariesElement'
    ],

    computed: {
        ...mapGetters({
            transactions: 'Address/getOutgoingTransactions'
        }),

        selectedPayment () {
            const { id: detailId } = this.$route.params

            if (!detailId) {
                return null
            }

            const detailTx = this.transactions.find((tx) => {
                const { id } = tx

                return id === detailId
            })

            return detailTx
        }
    }
}
</script>

<style scoped>

</style>
