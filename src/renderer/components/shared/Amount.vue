<template>
    <span class="amount">
        <span class="amount-value">{{ formattedAmount }}</span><span v-if="ticker" class="ticker">&nbsp;{{ ticker }}</span>
    </span>
</template>

<script>
import {bigintToString} from "lib/convert";

export default {
    name: "Amount",

    props: ['amount', 'ticker'],

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
    font-weight: var(--font-weight-bold);

    .amount-value {
        color: var(--color-amount);
    }

    .ticker {
        color: var(--color-ticker);
    }
}
</style>
