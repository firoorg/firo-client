<template>
    <section
        ref="container"
        class="denomination-selector"
    >
        <denomination
            v-for="denomination in Object.keys(coinsToMint).sort((x,y) => Number(x) - Number(y))"
            v-bind:key="denomination"
            :max-value-in-selector="maxValueInSelector"
            :denomination="denomination"
            :available-balance-remaining="getAvailableBalanceToMint"
            :increase="() => increaseCoinsToMint(denomination)"
            :decrease="() => decreaseCoinsToMint(denomination)"
            :value="coinsToMint[denomination]"
        />
    </section>
</template>

<script>
import Denomination from '@/components/Denomination'
import {convertToSatoshi} from "#/lib/convert";

export default {
    name: 'DenominationSelector',

    components: {
        Denomination
    },

    props: {
        // Total available balance for minting.
        availableBalance: {
            type: Number,
            required: true
        },

        mintFee: {
            type: Number,
            default: 1e5
        },

        mintSuggestions: {
            type: Object,
            default: () => {}
        },

        // When the user changes the amount of coins they want to mint, we'll be called with currentMintCost as the
        // first argument and coinsToMint as the second. We'll also be called when the component is mounted, where we'll
        // return what we're passed in in mintSuggestions.
        coinsToMintChanged: {
            type: Function,
            required: true
        }
    },

    data () {
        return {
            coinsToMint: Object.assign({
                '0.1': 0,
                '0.5': 0,
                '1': 0,
                '10': 0,
                '25': 0,
                '100': 0
            }, this.mintSuggestions)
        }
    },

    computed: {
        maxValueInSelector () {
            return Object.values(this.coinsToMint).reduce((x,y) => Math.max(x,y));
        },

        getAvailableBalanceToMint () {
            // Everything we're currently paying plus the fee for an additional mint.
            return Math.max(this.availableBalance - this.currentMintCost - this.mintFee, 0);
        },

        currentMintFees () {
            return Object.values(this.coinsToMint).reduce((x,y)=>x+y) * this.mintFee;
        },

        currentMintAmount () {
            return Object.entries(this.coinsToMint)
                .map((denomination, amount) => convertToSatoshi(denomination) * amount)
                .reduce((x,y)=>x+y);
        },

        currentMintCost () {
            return this.currentMintFees + this.currentMintAmount;
        }
    },

    mounted () {
        this.changed();
    },

    methods: {
        increaseCoinsToMint(denomination) {
            this.coinsToMint[denomination] += 1;
            this.changed();
        },

        decreaseCoinsToMint(denomination) {
            this.coinsToMint[denomination] -= 1;
            this.changed();
        },

        changed() {
            this.coinsToMintChanged(this.currentMintAmount, this.currentMintFees, this.coinsToMint);
        }
    }
}
</script>

<style lang="scss" scoped>
    .denomination-selector {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        height: 200px;
    }
</style>
