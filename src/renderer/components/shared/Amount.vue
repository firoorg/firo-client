<template>
    <span class="amount">
        <span class="amount-value">{{ formattedAmount }}</span><span v-if="ticker" class="ticker">&nbsp;{{ ticker }}</span>
    </span>
</template>

<script>
import {bigintToString} from "lib/convert";

export default {
    name: "Amount",
    props: {
        // value in satoshis or as a String whole coin value
        amount: {
            type: BigInt | String,
            required: true
        },

        ticker: {
            type: String,
            required: false
        }
    },

    computed: {
        formattedAmount () {
            if (typeof this.amount === "bigint") return bigintToString(this.amount)
            else return this.amount;
        }
    }
}
</script>

<style scoped lang="scss">
.amount {
    font-weight: bold;
}
</style>
