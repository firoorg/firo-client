<template>
    <Amount :amount="amount" :ticker="ticker" />
</template>

<script>
import Amount from "renderer/components/shared/Amount";
import {mapGetters} from "vuex";

export default {
    name: "ElysiumAmount",

    props: ['tx'],

    components: {
        Amount
    },

    computed: {
        ...mapGetters({
            tokenData: 'Elysium/tokenData'
        }),

        amount() {
            return this.tx.elysium.property.isDivisible ? this.tx.elysium.amount : this.tx.elysium.amount * 1e8;
        },

        ticker() {
            return (this.tokenData[this.tx.elysium.property.creationTx] || {ticker: ''}).ticker;
        }
    }
}
</script>

<style scoped>

</style>