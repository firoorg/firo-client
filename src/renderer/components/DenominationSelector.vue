<template>
    <section
        ref="container"
        class="denomination-selector"
    >
        <denomination
            v-for="denomination in denominations"
            :key="denomination"
            :max-value="maxValue"
            :max-height="maxHeight"
            :denomination="denomination"
            :on-change="onDenominationChange"
            :available-balance="getAvailableBalanceToMint"
        />
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
import Denomination from '@/components/Denomination'

export default {
    name: 'DenominationSelector',
    components: {
        Denomination
    },

    props: {
        onDenominationChange: {
            type: Function,
            default: () => {}
        },

        currentMintCosts: {
            type: Number,
            required: true
        }
    },

    data () {
        return {
            denominations: [0.1, 0.5, 1, 10, 100],
            maxHeight: 0
        }
    },

    computed: {
        ...mapGetters({
            currentDenominations: 'Mint/currentDenominations',
            availableXzcBalance: 'Balance/availableXzc'
        }),

        maxValue () {
            return Object.values(this.currentDenominations).reduce((x,y) => x > y ? x : y, 0)
        },

        getAvailableBalanceToMint () {
            // substract current costs + one additional fee for (potential) upcoming mint
            // todo get mint fee from config
            const available = this.availableXzcBalance - this.currentMintCosts - 100000

            return available > 0 ? available : 0
        }
    },

    mounted () {
        this.maxHeight = this.$el.clientHeight
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
