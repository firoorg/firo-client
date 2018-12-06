<template>
    <section
        ref="container"
        class="denomination-selector"
    >
        <spend-denomination
            v-for="denomination in denominations"
            :key="denomination"
            :denomination="denomination"
            :available="getAvailableAmountFor(denomination)"
            :current="getCurrentAmountFor(denomination)"
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

    data () {
        return {
            denominations: [1, 10, 25, 50, 100]
            // maxHeight: 0
        }
    },

    mounted () {
        // this.maxHeight = this.$el.clientHeight
    },

    computed: {
        ...mapGetters({
            mints: 'Mint/confirmedMintsPerDenomination',
            currentMints: 'ZerocoinSpend/spendFormMints'
        })
    },

    methods: {
        getAvailableAmountFor (denom) {
            return this.mints[denom] ? this.mints[denom] : 0
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
