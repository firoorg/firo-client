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
                <h2>Stay Private, Stay Flexibe</h2>
            </header>

            <p>According to your settings you'd like to keep ratio between your private and public funds around <strong>{{ percentageToHoldInZerocoin }}%</strong> – with the latest change this ratio got undershot.</p>
            <p>Therefore, we suggest to mint <strong>{{ remainingXzcToFulFillPercentageToHoldInZerocoin }} XZC</strong> now to be able to spend funds privately without delay and extra waiting times in the future.</p>


            <footer>
                <base-button :is-outline="true"
                             :is-dark="true"
                             @click.prevent="markAsNotified">
                    No, I will do it later
                </base-button>
                <base-button color="green"
                             :is-dark="true"
                             @click.prevent="fillAndRouteToMint">
                    Yes, review suggestion
                </base-button>
            </footer>
        </template>
    </base-popover>
</template>

<script>
    import types from '~/types'
    import { mapGetters, mapActions } from 'vuex'

    import NotificationIndicator from '@/components/Notification/NotificationIndicator'

    export default {
        name: 'PercentageToHoldInZerocoinNotification',

        components: {
            NotificationIndicator
        },

        computed: {
            ...mapGetters({
                availableXzc: 'Balance/availableXzc',
                confirmedXzcZerocoinRatio: 'Balance/confirmedXzcZerocoinRatio',
                percentageToHoldInZerocoin: 'Settings/percentageToHoldInZerocoin',
                isOutOfPercentageToHoldInZerocoinRange: 'Settings/isOutOfPercentageToHoldInZerocoinRange',
                showIsOutOfPercentageToHoldInZerocoinNotification: 'Settings/showIsOutOfPercentageToHoldInZerocoinNotification',
                remainingXzcToFulFillPercentageToHoldInZerocoin: 'Settings/remainingXzcToFulFillPercentageToHoldInZerocoin',
                suggestedMintsToFulfillRatio: 'Settings/suggestedMintsToFulfillRatio'
            })
        },

        methods: {
            ...mapActions({
                markAsNotified: types.settings.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED,
                addDenomination: types.mint.ADD_DENOMINATION
            }),

            fillAndRouteToMint () {
                console.log('remainingXzcToMint', this.remainingXzcToFulFillPercentageToHoldInZerocoin)
                console.log(this.suggestedMintsToFulfillRatio)

                Object.entries(this.suggestedMintsToFulfillRatio).forEach((pairs) => {
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
