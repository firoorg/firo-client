<template>
    <span class="amount">{{ formattedAmount }}</span>
</template>

<script>
import {convertToCoin} from "lib/convert";

export default {
    name: "Amount",
    props: {
        // value in satoshis
        amount: {
            type: Number,
            required: true
        }
    },

    computed: {
        formattedAmount () {
            return convertToCoin(this.amount)
        }
    }
}
</script>

<style scoped>
.amount {
    font-weight: bold;
}
</style>
