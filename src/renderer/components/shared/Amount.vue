<template>
    <span class="amount">
        <span class="amount-value">{{ formattedAmount }}</span><span v-if="ticker" class="ticker">&nbsp;{{ ticker }}</span>
    </span>
</template>

<script>
import {convertToCoin} from "lib/convert";

export default {
    name: "Amount",
    props: {
        // value in satoshis or as a String whole coin value
        amount: {
            type: Number | String,
            required: true
        },

        ticker: {
            type: String,
            required: false
        }
    },

    computed: {
        formattedAmount () {
            if (typeof this.amount === "number") return convertToCoin(this.amount)
            else return this.amount;
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/typography";

.amount {
    font-weight: bold;
}
</style>
