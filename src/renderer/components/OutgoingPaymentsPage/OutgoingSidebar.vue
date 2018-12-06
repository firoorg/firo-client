<template>
    <router-view
        v-bind="selectedPayment"
    />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'OutgoingSidebar',

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
