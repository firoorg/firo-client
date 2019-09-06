<template>
    <div class="mint-stats">
        <notice
            class="stats-wrap"
            :class="{ 'in-progress': isInProgress }"
        >
            <div class="stats">
                <div class="stat">
                    <div class="value">
                        {{ availableZcoin }} <span>xzc</span>
                    </div>
                    <div class="desc">
                        {{ $t('mint.overview.stats.available-zcoin-balance') }}
                    </div>
                </div>

                <div
                    v-if="isInProgress"
                    class="stat"
                >
                    <div class="value">
                        {{ inProgress }} <span>xzc</span>
                    </div>
                    <div class="des">
                        {{ $t('mint.overview.stats.balance-in-progress') }}
                    </div>
                </div>

                <div class="stat">
                    <div class="value">
                        {{ alreadyMinted }} <span>xzc</span>
                    </div>
                    <div class="des">
                        {{ $t('mint.overview.stats.zerocoin-balance') }}
                    </div>
                </div>
            </div>
        </notice>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { convertToCoin } from '#/lib/convert'
import Notice from '@/components/Notification/Notice'

export default {
    name: 'MintStats',
    components: {
        Notice
    },

    computed: {
        ...mapGetters({
            availableXzc: 'Balance/availableXzc',
            availableZerocoin: 'Balance/availableZerocoin',
            mintsInProgress: 'Transactions/mintsInProgress'
        }),

        availableZcoin () {
            // truncate to two decimal places
            return convertToCoin(this.availableXzc - this.availableXzc % 1e6);
        },

        isInProgress () {
            return !!this.mintsInProgress.length
        },

        inProgress () {
            const value = this.mintsInProgress.reduce((accumulator, { amount }) => {
                return accumulator + amount
            }, 0)

            // truncate to two decimal places
            return convertToCoin(value - value % 1e6);
        },

        alreadyMinted () {
            // truncate to two decimal places
            return convertToCoin(this.availableZerocoin - this.availableZerocoin % 1e6);
        }
    }
}
</script>

<style lang="scss" scoped>
    .mint-stats {
        margin-top: emRhythm(6);

        display: flex;
        justify-content: center;
    }

    .stats-wrap {
        width: 60%;

        &.in-progress {
            width: 80%;
        }
    }

    .stats {
        display: flex;
        justify-content: space-around;
    }

    .stat {
        max-width: 15rem;
        padding: emRhythm(2) 0;

        .value {
            @include font-heavy();
            @include setType(3, $ms-up1);
            margin: 0;
            text-align: center;
            color: $color--comet-dark;

            span {
                @include font-regular();
                color: $color--comet-medium;
            }
        }

        .desc {
            font-style: italic;
            color: $color--comet;
        }
    }
</style>
