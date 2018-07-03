<template>
    <section ref="container" class="denomination-selector">
        <denomination v-for="denomination in denominations"
                      :key="denomination"
                      :max-value="maxValue"
                      :max-height="maxHeight"
                      :denomination="denomination">
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
                mints: 'Mint/mints'
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
            }
        }
    }
</script>

<style lang="scss" scoped>
    .denomination-selector {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        height: 300px;
    }
</style>