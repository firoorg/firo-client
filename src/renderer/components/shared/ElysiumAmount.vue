<template>
    <Amount :amount="amount" :ticker="ticker" />
</template>

<script>
import Amount from "renderer/components/shared/Amount";

export default {
    name: "ElysiumAmount",

    props: ['tx'],

    components: {
        Amount
    },

    computed: {
        amount() {
            return this.tx.elysium.property.isDivisible ? this.tx.elysium.amount * 1e2 : this.tx.elysium.amount * 1e8;
        },

        ticker() {
            const m = this.tx.elysium.property.name.match(/\(([A-Z0-9]{3,4})\)$/);
            if (m) return m[1];
            else return `E:${this.tx.elysium.property.id}`;
        }
    }
}
</script>

<style scoped>

</style>