<template>
    <section
        ref="container"
        class="denomination-selector"
    >
        <spend-denomination
            v-for="denomination in denominationTypes"
            :key="denomination"
            :denomination="denomination"
            :available="getAvailableAmountFor(denomination)"
            :current="getCurrentAmountFor(denomination)"
            :increase-disabled="canIncreaseInputs"
            @change="onDenominationChange"
        />
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
import SpendDenomination from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendDenomination'

export default {
    name: 'DenominationSelector',
    components: {
        SpendDenomination
    },

    props: {
        onDenominationChange: {
            type: Function,
            default: () => {}
        }
    },

    computed: {
        ...mapGetters({
            mints: 'Mint/confirmedMintsPerDenomination',
            currentMints: 'ZerocoinSpend/spendFormMints',
            denominationTypes: 'ZerocoinSpend/denominationTypes',
            maxAmountOfMintInputsPerTx: 'ZerocoinSpend/maxAmountOfMintInputsPerTx'
        }),

        canIncreaseInputs () {
            const amount =  Object.values(this.currentMints)
                .reduce((accumulator, denomAmount) => accumulator + denomAmount, 0)

            return amount > this.maxAmountOfMintInputsPerTx - 1
        }
    },

    methods: {
        getAvailableAmountFor (denom) {
            return this.mints[String(denom)] ? this.mints[String(denom)] : 0
        },

        getCurrentAmountFor (denom) {
            return this.currentMints[`${denom}`] || 0
        }
    }
}
</script>

<style lang="scss" scoped>
    .denomination-selector {
        display: flex;
        flex-direction: column;
        // height: 250px;
    }
</style>
