<template>
    <section
        ref="container"
        class="denomination-selector"
    >
        <denomination
            v-for="denomination in Object.keys(coinsToMint).map(Number).sort((x,y) => x - y)"
            :key="denomination"
            :max-value-in-selector="maxValueInSelector"
            :denomination="denomination"
            :available-balance-remaining="getAvailableBalanceToMint"
            :increase="() => increaseCoinsToMint(denomination)"
            :decrease="() => decreaseCoinsToMint(denomination)"
            :existing-value="(existingMints[denomination] || {confirmed: 0}).confirmed"
            :value="coinsToMint[denomination]"
            :disabled="disabled"
        />
    </section>
</template>

<script>
import Denomination from '@/components/Denomination'

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

        // This will be set after denominations have been selected and the confirmation dialog is initiated.
        disabled: {
            type: Boolean,
            required: true
        },

        // When the user changes the amount of coins they want to mint, we'll be called with currentMintCost as the
        // first argument and coinsToMint as the second. We'll also be called when the component is mounted, where we'll
        // return what we're passed in in mintSuggestions.
        coinsToMintChanged: {
            type: Function,
            required: true
        },

        // {[denomination: number]: {confirmed: number, unconfirmed: number}
        existingMints: {
            type: Object,
            required: true
        }
    },

    data () {
        return {
            coinsToMint: Object.assign({
                0.05e8: 0,
                0.1e8: 0,
                0.5e8: 0,
                1e8: 0,
                10e8: 0,
                25e8: 0,
                100e8: 0
            }, this.mintSuggestions)
        }
    },

    computed: {
        maxValueInSelector () {
            return Object.keys(this.coinsToMint)
                .map(k => this.coinsToMint[k] + (this.existingMints[k] || {confirmed: 0}).confirmed)
                .reduce((x,y) => Math.max(x,y));
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
                .map(([denomination, amount]) => denomination * amount)
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
        },

        // This method will be called by our parent after a spend is made to reset our UI.
        reset() {
            this.coinsToMint = {
                0.05e8: 0,
                0.1e8: 0,
                0.5e8: 0,
                1e8: 0,
                10e8: 0,
                25e8: 0,
                100e8: 0
            };
            this.changed();
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
