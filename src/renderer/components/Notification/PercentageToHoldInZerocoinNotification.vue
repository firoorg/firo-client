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
            <slot /> <notification-indicator
                v-show="isOutOfPercentageToHoldInZerocoin"
                :has-shadow="true"
            />
        </template>

        <template slot="content">
            <div>
                <header>
                    <h2 v-html="$t('mint.flyout-process-mints.title')" />
                </header>

                <p v-html="$t('mint.flyout-process-mints.description')" />

                <footer>
                    <base-button
                        :is-outline="true"
                        :is-dark="true"
                        @click.prevent="markAsNotified"
                    >
                        {{ $t('mint.flyout-process-mints.button__cancel--secondary') }}
                    </base-button>
                    <base-button
                        color="green"
                        :is-dark="true"
                        @click.prevent="fillAndRouteToMint"
                    >
                        {{ $t('mint.flyout-process-mints.button__review-suggestion--primary') }}
                    </base-button>
                </footer>
            </div>
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
            isOutOfPercentageToHoldInZerocoin: 'Settings/isOutOfPercentageToHoldInZerocoin',
            showIsOutOfPercentageToHoldInZerocoinNotification: 'Settings/showIsOutOfPercentageToHoldInZerocoinNotification',
            remainingXzcToFulFillPercentageToHoldInZerocoin: 'Settings/remainingXzcToFulFillPercentageToHoldInZerocoin',
            suggestedMintsToFulfillRatio: 'Settings/suggestedMintsToFulfillRatio'
        })
    },

    methods: {
        ...mapActions({
            markAsNotified: types.settings.MARK_PERCENTAGE_TO_HOLD_IN_ZEROCOIN_AS_NOTIFIED,
        }),

        fillAndRouteToMint () {
            this.markAsNotified();

            this.$router.push({
                path: '/anonymize',
                query: {
                    coinsToMint: this.suggestedMintsToFulfillRatio
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>

</style>
