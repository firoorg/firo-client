<template>
    <section ref="container" class="denomination-selector">
        <denomination v-for="denomination in denominations"
                      :key="denomination"
                      :max-value="maxValue"
                      :max-height="maxHeight"
                      :denomination="denomination"
                      :on-change="onDenominationChange"
                      :available-balance="getAvailableBalanceToMint">
        </denomination>
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
                denominations: [1, 10, 25, 50, 100],
                maxHeight: 0
            }
        },

        mounted () {
            this.maxHeight = this.$el.clientHeight
        },

        computed: {
            ...mapGetters({
                currentDenominations: 'Mint/currentDenominations',
                mints: 'Mint/confirmedMintsPerDenomination',
                availableXzcBalance: 'Balance/availableXzc'
            }),

            maxValue () {
                let max = 0

                for (let denom of this.denominations) {
                    const denoms = this.currentDenominations[`${denom}`] || 0
                    const mints = this.mints[`${denom}`] || 0
                    const total = denoms + mints

                    if (!total) {
                        continue
                    }

                    if (max < total) {
                        max = total
                    }
                }

                return max
            },

            getAvailableBalanceToMint () {
                // substract current costs + one additional fee for (potential) upcoming mint
                // todo get mint fee from config
                const available = this.availableXzcBalance - this.currentMintCosts - 100000

                return available > 0 ? available : 0
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
