<template>
    <section class="mint-zerocoin">
        <div v-scrollable>
            <section class="mint-selection">
                <header>
                    <h1 v-html="$t('mint.overview.title')" />
                    <p v-html="$t('mint.overview.description')" />
                </header>

                <div class="content-wrapper">
                    <denomination-selector
                        :on-denomination-change="onDenominationChange"
                        :current-mint-costs="currentMintCostInSatoshi"
                    />

                    <transition name="fade">
                        <onboarding-notice
                            v-if="!availableXzc"
                            class="onboarding"
                        >
                            <template slot="header">
                                <h3>{{ $t('onboarding.make-request-first.mint.title') }}</h3>
                            </template>
                            <template slot="content">
                                <i18n
                                    path="onboarding.make-request-first.mint.description"
                                    tag="p"
                                >
                                    <router-link
                                        :to="{ name: 'receive-zcoin' }"
                                        place="linkToCreatePaymentRequest"
                                    >
                                        {{ $t('onboarding.make-request-first.mint.button__linkToCreatePaymentRequest') }}
                                    </router-link>
                                </i18n>
                            </template>
                        </onboarding-notice>
                        <onboarding-notice v-else-if="isOutOfPercentageToHoldInZerocoin">
                            <template slot="header">
                                <h3>{{ $t('onboarding.process-mints.title') }}</h3>
                            </template>
                            <template slot="content">
                                <i18n
                                    path="onboarding.process-mints.description"
                                    tag="p"
                                    :places="{ percentageToHoldInZerocoin, remainingXzcToFulFillPercentageToHoldInZerocoin }"
                                >
                                    <nobr place="percentageToHoldInZerocoin">
                                        <strong>{{ percentageToHoldInZerocoin }}&#8201;%</strong>
                                    </nobr>
                                    <nobr place="remainingXzcToFulFillPercentageToHoldInZerocoin">
                                        <strong>{{ remainingXzcToFulFillPercentageToHoldInZerocoin }}&#8201;XZC</strong>
                                    </nobr>
                                </i18n>
                            </template>
                            <template slot="actions">
                                <base-onboarding-button @click.prevent="fillUpPercentateToHoldInZerocoin">
                                    {{ $t('onboarding.process-mints.button__add-selection--primary') }}
                                </base-onboarding-button>
                            </template>
                        </onboarding-notice>
                        <mint-stats v-else />
                    </transition>
                </div>
            </section>
        </div>
        <section
            v-scrollable
            class="current-mint-detail"
        >
            <template v-if="!hasCurrentMints && hasMintsInProgress">
                <section class="mints-in-progress">
                    <header>
                        <h2 v-html="$t('mint.detail-process-mint.title')" />
                        <p>{{ $tc('mint.detail-process-mint.description', mintsInProgress.length) }}</p>
                    </header>

                    <mints-in-progress-list :mints="mintsInProgress" />
                </section>
            </template>
            <template v-else>
                <section class="current-mint">
                    <header>
                        <h2 v-html="$t('mint.detail-create-mint.title')" />
                        <div v-show="hasMintsInProgress">
                            <base-popover
                                :disabled="!enableProgressList"
                                :auto-hide="true"
                                placement="top-end"
                                popover-class="comet"
                                class="mints-in-process-popover"
                                trigger="click"
                            >
                                <template slot="target">
                                    <div class="list-icon">
                                        <stack />
                                        <transition name="fade">
                                            <notification-indicator
                                                v-show="hasMintsInProgress"
                                                class="indicator"
                                            />
                                        </transition>
                                    </div>
                                </template>

                                <template slot="content">
                                    <div>
                                        <header>
                                            <h3 v-html="$t('mint.detail-process-mint.title')" />
                                            <p> {{ $tc('mint.detail-process-mint.description', mintsInProgress.length) }} </p>
                                        </header>

                                        <mints-in-progress-list
                                            :mints="mintsInProgress"
                                            :is-monochrome="true"
                                        />
                                    </div>
                                </template>
                            </base-popover>
                        </div>
                    </header>
                    <current-mints :current-mints="currentMints" />
                </section>
                <form
                    class="checkout"
                    @submit.prevent="onSubmit"
                >
                    <div class="has-divider">
                        <fees-and-amount
                            :fee="{ label: $t('mint.detail-create-mint.label__fees'), amount: currentDenominationFees }"
                            :amount="currentMintCostInSatoshi"
                            translation-namespace="mint.detail-create-mint"
                        />
                    </div>
                    <mint-steps
                        :form-is-valid="canSubmit"
                        :cleanup-form="cleanupForm"
                        @steps-started="() => enableProgressList = false"
                        @steps-close="() => enableProgressList = true"
                        @steps-done="cleanupForm"
                    />
                    <!--
                    <mint-confirm-dialog :can-submit="canSubmit"
                                         :is-open="showPopover"
                                         :on-cancel="onCancel"
                                         :on-confirm="onConfirm"
                                         popover-class="notice">
                        <h3>Really?</h3>
                    </mint-confirm-dialog>
                    -->
                </form>
            </template>
        </section>
    </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import types from '~/types'

import { convertToSatoshi } from '#/lib/convert'

import DenominationSelector from '@/components/DenominationSelector'
import OnboardingNotice from '@/components/Notification/OnboardingNotice'
import CurrentMints from '@/components/payments/CurrentMints'
import FeesAndAmount from '@/components/payments/FeesAndAmount'
// import MintConfirmDialog from '@/components/MintZerocoinPage/MintConfirmDialog'
import MintSteps from '@/components/MintZerocoinPage/MintSteps'
import MintsInProgressList from '@/components/MintZerocoinPage/MintsInProgressList'
import Stack from '@/components/Icons/Stack'
import NotificationIndicator from '@/components/Notification/NotificationIndicator'
import MintStats from '@/components/MintZerocoinPage/MintStats'

export default {
    name: 'MintZerocoinPage',
    components: {
        MintStats,
        OnboardingNotice,
        NotificationIndicator,
        MintsInProgressList,
        MintSteps,
        // MintConfirmDialog,
        FeesAndAmount,
        CurrentMints,
        DenominationSelector,
        Stack
    },

    data () {
        return {
            popoverStatus: '',
            enableProgressList: true
        }
    },

    computed: {
        ...mapGetters({
            availableXzc: 'Balance/availableXzc',
            currentPassphrase: 'App/currentPassphrase',
            denominations: 'Mint/currentDenominations',
            currentDenominationFees: 'Mint/currentDenominationFees',
            mintsInProgress: 'Mint/mintsInProgress',
            isOutOfPercentageToHoldInZerocoin: 'Settings/isOutOfPercentageToHoldInZerocoin',
            percentageToHoldInZerocoin: 'Settings/percentageToHoldInZerocoin',
            remainingXzcToFulFillPercentageToHoldInZerocoin: 'Settings/remainingXzcToFulFillPercentageToHoldInZerocoin'
        }),

        currentMints () {
            return Object.entries(this.denominations)
            // filter out unused
                .filter((pair) => pair[1])
            // transform to [{denomination: '25', amount: 1}]
                .map((pair) => {
                    const [ denomination, amount ] = pair

                    return {
                        denomination,
                        amount,
                        cost: parseInt(denomination) * amount
                    }
                })
        },

        hasCurrentMints () {
            return !!this.currentMints.length
        },

        currentMintCost () {
            return this.currentMints.reduce((accumulator, current) => accumulator + current.cost, 0)
        },

        currentMintCostInSatoshi () {
            return convertToSatoshi(this.currentMintCost)
        },

        canSubmit () {
            return !!Object.keys(this.currentMints).length
        },

        hasMintsInProgress () {
            return !!this.mintsInProgress.length
        },

        mintsInProgressLength () {
            return this.mintsInProgress.length
        }
    },

    methods: {
        ...mapActions({
            resetDenominations: types.mint.RESET_DENOMINATIONS,
            fillUpPercentateToHoldInZerocoin: types.settings.FILL_UP_PERCENTAGE_TO_HOLD_IN_ZEROCOIN,
            doMint: types.mint.DO_MINT
        }),

        /*
            onConfirm (popoverReset) {
                console.log('on confirm')
                this.popoverStatus = 'showSuccess'

                this.doMint({
                    denominations: this.currentMints
                })

                this.reset(popoverReset)
            },

            reset (popoverReset) {
                this.popoverStatus = ''
                this.resetDenominations()

                if (popoverReset) {
                    popoverReset()
                }
            },
            */

        /// -- - - - - - -

        onDenominationChange () {
            this.isConfirmed = false
        },

        onSubmit () {
            this.doMint({
                denominations: this.currentMints,
                auth: {
                    passphrase: this.currentPassphrase
                }
            })

            // this.resetDenominations()
            // this.reset(popoverReset)
        },

        cleanupForm () {
            this.$log.info('cleaning up mints...')
            this.resetDenominations()
        }
    }
}
</script>

<style lang="scss" scoped>
    .mint-zerocoin {
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 3fr  minmax(30rem, 2fr);
    }

    .mint-selection,
    .current-mint-detail {
        position: relative;
    }

    .mint-selection {
        padding: emRhythm(5) emRhythm(4);
        min-height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;

        header {
            display: flex;
            align-items: center;
            margin-bottom: emRhythm(7);

            h1 {
                margin-bottom: 0;
            }

            p {
                @include description(emRhythm(45));
                margin-left: emRhythm(4);
                color: $color--polo-dark;
            }
        }

        .content-wrapper {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }
    }

    .mints-in-progress {
        header {
            @include h2-with-description(inherit, $color--comet);
            margin-bottom: emRhythm(7);
        }
    }

    .current-mint-detail {
        //background: $gradient--comet-dark-horizontal;
        //background: $gradient--polo-horizontal;
        background: $color--white;
        padding: emRhythm(5) emRhythm(6);
        height: 100vh;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .has-divider {
        @include divider-top-with-gradient();
    }

    .submit {
        width: 100%;
    }

    .current-mint {
        header {
            // margin-left: emRhythm(3, $ms-up2);
            margin-bottom: emRhythm(7);

            @include h2-with-description(inherit, $color--polo-dark);

            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }

    .list-icon {
        position: relative;
        cursor: pointer;

        /deep/ svg > g > path,
        /deep/ svg g > g {
            transition: stroke 0.15s ease-in;
        }

        &:hover {
            /deep/ svg > g > path {
                stroke: $color--dark;
            }
            /deep/ svg g g {
                stroke: $color--comet-dark;
            }
        }

        .indicator {
            position: absolute;
            right: 0;
            transform: translateX(50%);
            top: 50%;
        }
    }

    .onboarding {
        margin-top: emRhythm(7);
    }
</style>
