<template>
    <section class="mint-zerocoin">
        <div v-scrollable>
            <section class="mint-selection">
                <header>
                    <h1 v-html="$t('mint.overview.title')" />
                    <p v-html="$t('mint.overview.description')" />
                </header>

                <div class="content-wrapper">
                    <!-- It's critical that DenominationSelector is disabled properly. Otherwise, the user might end up
                         sending a value they didn't confirm. -->
                    <denomination-selector
                        ref="denominationSelector"
                        :available-balance="availableXzc"
                        :mint-suggestions="coinsToMint"
                        :coins-to-mint-changed="coinsToMintChanged"
                        :disabled="popoverStep !== 'initial'"
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
                        <mint-stats v-else />
                    </transition>
                </div>
            </section>
        </div>
        <section
            v-scrollable
            class="current-mint-detail"
        >
            <template v-if="!mintAmount && hasMintsInProgress">
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
                    <current-mints :current-mints="coinsToMint" />
                </section>

                <div class="checkout">
                    <div class="has-divider">
                        <fees-and-amount
                            :fee="{ label: $t('mint.detail-create-mint.label__fees'), amount: mintFees }"
                            :amount="mintAmount"
                            translation-namespace="mint.detail-create-mint"
                        />
                    </div>

                    <div class="buttons">
                        <base-button
                            v-if="!['initial', 'waitToConfirm', 'waitForReply'].includes(popoverStep)"
                            color="red"
                            @click.prevent="closePopover"
                        >
                            Cancel
                        </base-button>

                        <v-popover
                            :open="popoverStep !== 'initial'"
                            placement="top-end"
                            popover-class="tooltip popover multi-step-popover"
                            class="send-button-popover-container"
                            trigger="manually"
                            :auto-hide="false"
                            :handle-resize="true"
                        >
                            <base-button
                                v-if="popoverStep === 'initial'"
                                color="green"
                                class="expanded"
                                :disabled="!mintAmount"
                                @click.prevent="beginWaitToConfirmStep"
                            >
                                Anonymize Now
                            </base-button>

                            <circular-timer
                                v-else-if="popoverStep === 'waitToConfirm'"
                                @complete="beginConfirmStep"
                            />

                            <base-button
                                v-else-if="popoverStep === 'confirm'"
                                color="green"
                                @click.prevent="beginPassphraseStep"
                            >
                                Confirm
                            </base-button>

                            <base-button
                                v-else-if="popoverStep === 'passphrase'"
                                color="green"
                                @click.prevent="attemptMint"
                            >
                                Mint
                            </base-button>


                            <div
                                v-else-if="popoverStep === 'waitForReply'"
                                class="wait-for-reply-icon"
                            >
                                ⧗
                            </div>

                            <template slot="popover">
                                <mint-step-confirm
                                    v-if="popoverStep === 'waitToConfirm' || popoverStep === 'confirm'"
                                    :mint-amount="mintAmount"
                                    :mint-fees="mintFees"
                                    :mints="coinsToMint"
                                />

                                <send-step-passphrase
                                    v-else-if="popoverStep === 'passphrase'"
                                    v-model="passphrase"
                                    @onEnter="attemptMint"
                                />

                                <send-step-wait-for-reply
                                    v-else-if="popoverStep === 'waitForReply'"
                                />

                                <send-step-error
                                    v-else-if="popoverStep === 'error'"
                                    :error-message="errorMessage"
                                />
                            </template>
                        </v-popover>
                    </div>
                </div>
            </template>
        </section>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'

import CircularTimer from '@/components/Icons/CircularTimer';
import DenominationSelector from '@/components/DenominationSelector'
import OnboardingNotice from '@/components/Notification/OnboardingNotice'
import CurrentMints from '@/components/payments/CurrentMints'
import FeesAndAmount from '@/components/payments/FeesAndAmount'
import MintsInProgressList from '@/components/MintZerocoinPage/MintsInProgressList'
import Stack from '@/components/Icons/Stack'
import NotificationIndicator from '@/components/Notification/NotificationIndicator'
import MintStats from '@/components/MintZerocoinPage/MintStats'

import MintStepConfirm from '@/components/MintZerocoinPage/MintStepConfirm';
import SendStepPassphrase from '@/components/PaymentSidebars/SendSteps/Passphrase';
import SendStepWaitForReply from '@/components/PaymentSidebars/SendSteps/WaitForReply';
import SendStepError from '@/components/PaymentSidebars/SendSteps/Error';

export default {
    name: 'AnonymizePage',
    components: {
        CircularTimer,
        MintStepConfirm,
        SendStepPassphrase,
        SendStepWaitForReply,
        SendStepError,

        MintStats,
        OnboardingNotice,
        NotificationIndicator,
        MintsInProgressList,
        FeesAndAmount,
        CurrentMints,
        DenominationSelector,
        Stack
    },

    data () {
        return {
            popoverStatus: '',
            enableProgressList: true,

            errorMessage: '',

            // Valid progressions are:
            //
            // initial -> waitToConfirm
            // waitToConfirm -> confirm
            // confirm -> initial | passphrase
            // passphrase -> initial | waitForReply
            // waitForReply -> incorrectPassphrase | error | complete
            // error -> initial
            // incorrectPassphrase -> initial | passphrase
            // complete -> initial
            popoverStep: 'initial',

            passphrase: '',
            mintAmount: 0,
            mintFees: 0,
            // {[denomination: string]: number}
            coinsToMint: this.$route.query.coinsToMint || {},
        }
    },

    computed: {
        ...mapGetters({
            availableXzc: 'Balance/availableXzc',
            mintsInProgress: 'Transactions/mintsInProgress',
        }),

        hasMints () {
            return !!Object.values(this.coinsToMint).find(x=>x);
        },

        hasMintsInProgress () {
            return !!Object.keys(this.mintsInProgress).length
        }
    },

    methods: {
        recalculatePopoverPosition () {
            // v-popover only knows to recalculate position on resize events, so fake that one happened in order to
            // trigger the update.
            window.dispatchEvent(new Event('resize'));
        },

        beginWaitToConfirmStep() {
            this.popoverStep = 'waitToConfirm';
            this.recalculatePopoverPosition();
        },

        beginConfirmStep() {
            this.popoverStep = 'confirm';
            this.recalculatePopoverPosition();
        },

        beginPassphraseStep() {
            this.popoverStep = 'passphrase';
            this.recalculatePopoverPosition();
        },

        closePopover() {
            this.popoverStep = 'initial';
        },

        beginIncorrectPassphraseStep() {
            this.popoverStep = 'passphrase';
            this.recalculatePopoverPosition();
        },

        beginErrorStep(errorMessage) {
            this.errorMessage = errorMessage;
            this.popoverStep = 'error';
        },

        beginCompleteStep() {
            this.cleanupForm();
        },

        cleanupForm() {
            this.popoverStep = 'initial';
            this.$refs.denominationSelector.reset();
        },

        async attemptMint() {
            // This will have the effect of preventing the user from sending again without re-entering their passphrase.
            // JavaScript is single threaded, so there should be no race condition possible with an interruption between
            // the value check and the value assignment.
            let passphrase = this.passphrase;
            this.passphrase = '';
            if (!passphrase) {
                return;
            }

            this.popoverStep = 'waitForReply';
            this.recalculatePopoverPosition();

            try {
                await this.$daemon.mintZerocoin(passphrase, this.coinsToMint);
            } catch (e) {
                // Error code -14 indicates an incorrect passphrase.
                if (e.error && e.error.code === -14) {
                    this.beginIncorrectPassphraseStep();
                } else if (e.error && e.error.message) {
                    this.beginErrorStep(e.error.message);
                } else {
                    this.beginErrorStep(JSON.stringify(e));
                }

                return;
            }

            this.beginCompleteStep();
        },

        coinsToMintChanged(mintAmount, mintFees, coinsToMint) {
            this.mintAmount = mintAmount;
            this.mintFees = mintFees;
            this.coinsToMint = coinsToMint;
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

    .send-button-popover-container {
        display: inline-block;
    }

    .buttons {
        text-align: center;

        button {
            display: inline-block;
            width: 10em;

            &.expanded {
                width: 20em;
            }
        }
    }
</style>

