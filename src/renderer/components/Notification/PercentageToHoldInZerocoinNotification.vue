<template>
    <base-popover
            :open="showIsOutOfPercentageToHoldInZerocoinNotification"
            placement="right-auto"
            popover-class="private advice"
            boundaries-element="body"
            class="out-of-percentage-to-hold-in-zerocoin"
            trigger="manually"
    >
        <template slot="target">
            <slot /> <notification-indicator v-show="isOutOfPercentageToHoldInZerocoinRange" :has-shadow="true" />
        </template>

        <template slot="content">
            <header>
                <h2>Percentage to hold in Zerocoin</h2>
            </header>

            <p>Aenean lacinia bibendum nulla sed consectetur. Donec sed odio dui.</p>

            <footer>
                <base-button :is-outline="true"
                             :is-dark="true"
                             @click.prevent="markAsNotified">
                    Not now
                </base-button>
                <base-button color="green"
                             :is-dark="true"
                             @click.prevent="fillAndRouteToMint">
                    Mint now
                </base-button>
            </footer>
        </template>
    </base-popover>
</template>

<script>
    import types from '~/types'
    import { mapGetters, mapActions } from 'vuex'
    import { getDenominationsToMint } from '#/lib/convert'

    import NotificationIndicator from '@/components/Notification/NotificationIndicator'

    export default {
        name: 'PercentageToHoldInZerocoinNotification',

        components: {
            NotificationIndicator
        },

        computed: {
            ...mapGetters({
                availableXzc: 'Balance/availableXzc',
                xzcZerocoinRatio: 'Balance/xzcZerocoinRatio',
                percentageToHoldInZerocoin: 'Settings/percentageToHoldInZerocoin',
                isOutOfPercentageToHoldInZerocoinRange: 'Settings/isOutOfPercentageToHoldInZerocoinRange',
                showIsOutOfPercentageToHoldInZerocoinNotification: 'Settings/showIsOutOfPercentageToHoldInZerocoinNotification'
            })
        },

        methods: {
            ...mapActions({
                markAsNotified: types.settings.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED,
                addDenomination: types.mint.ADD_DENOMINATION
            }),

            fillAndRouteToMint () {
                const remaining = Math.floor((this.availableXzc * ((this.percentageToHoldInZerocoin / 100) - this.xzcZerocoinRatio)) / 100000000)
                const { toMint } = getDenominationsToMint(remaining)

                Object.entries(toMint).forEach((pairs) => {
                    const [ denom, amount ] = pairs

                    for (let i = 0; i < amount; i++) {
                        this.addDenomination(denom)
                    }
                })

                this.markAsNotified()
                this.$router.push({ name: 'mint-zerocoin' })
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
