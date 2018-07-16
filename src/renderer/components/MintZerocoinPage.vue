<template>
    <section class="mint-zerocoin">
        <div class="scrollable-height">
            <section class="mint-selection">
                <header>
                    <h1>
                        Anonymize<br>
                        Zcoin
                    </h1>
                    <p>
                        Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, massa justo sit amet risus.
                    </p>
                </header>

                <denomination-selector :on-denomination-change="onDenominationChange" />
            </section>
        </div>
        <section class="current-mint-detail scrollable-height">
            <template v-if="!hasCurrentMints && hasMintsInProgress">
                <section class="mints-in-progress">
                    <h2>Mints in Progress</h2>

                    <mints-in-progress-list :mints="mintsInProgress" />
                </section>
            </template>
            <template v-else>
                <section class="current-mint">
                    <header>
                        <h2>Create Mint</h2>
                        <div v-show="hasMintsInProgress">
                            <base-popover
                                    :disabled="showPopover"
                                    :auto-hide="true"
                                    placement="bottom"
                                    popover-class="comet"
                                    class="mints-in-process-popover"
                                    :boundaries-element="this.$refs.grid"
                                    trigger="click"
                            >
                                <template slot="target">
                                    <base-badge :visible="hasMintsInProgress"
                                                :count="mintsInProgressLength">
                                        Icon
                                    </base-badge>
                                </template>

                                <template slot="content">
                                    <header>
                                        <h3>Mints in Progress</h3>
                                        <p>Nulla vitae elit libero, a pharetra augue Integer posuere erat.</p>
                                    </header>

                                    <mints-in-progress-list :mints="mintsInProgress" />
                                </template>
                            </base-popover>
                        </div>
                    </header>
                    <current-mints :current-mints="currentMints" />
                </section>
                <form class="checkout" @submit.prevent="onSubmit">
                    <div class="has-divider">
                        <fees-and-amount :fee="{ label: 'Fees', amount: totalMintFee }"
                                         :amount="currentMintCost" />
                    </div>
                    <mint-confirm-dialog :can-submit="canSubmit"
                                         :is-open="showPopover"
                                         :on-cancel="onCancel"
                                         :on-confirm="onConfirm"
                                         popover-class="notice">
                        <h3>Really?</h3>
                    </mint-confirm-dialog>
                </form>
            </template>
        </section>
    </section>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import types from '~/types'

    import DenominationSelector from '@/components/DenominationSelector'
    import CurrentMints from '@/components/MintZerocoinPage/CurrentMints'
    import FeesAndAmount from '@/components/FeesAndAmount'
    import MintConfirmDialog from '@/components/MintZerocoinPage/MintConfirmDialog'
    import MintsInProgressList from '@/components/MintZerocoinPage/MintsInProgressList'

    export default {
        name: 'MintZerocoinPage',
        components: {
            MintsInProgressList,
            MintConfirmDialog,
            FeesAndAmount,
            CurrentMints,
            DenominationSelector
        },

        data () {
            return {
                popoverStatus: ''
            }
        },

        computed: {
            ...mapGetters({
                denominations: 'Mint/currentDenominations',
                mintsInProgress: 'Mint/mintsInProgress'
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

            totalMintFee () {
                return this.currentMints.reduce((accumulator, current) => accumulator + current.amount, 0) / 1000
            },

            canSubmit () {
                return !!Object.keys(this.currentMints).length
            },

            showPopover () {
                return !!this.popoverStatus
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
                doMint: types.mint.DO_MINT
            }),

            onDenominationChange () {
                this.popoverStatus = ''
            },

            onSubmit () {
                console.log('start minting')
                this.popoverStatus = 'showConfirm'
            },

            onCancel () {
                console.log('on cancel')
                this.popoverStatus = ''
            },

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
            }
        }
    }
</script>

<style lang="scss" scoped>
    .mint-zerocoin {
        display: grid;
        box-sizing: border-box;
        grid-template-columns: 3fr  2fr;
    }

    .mint-selection,
    .current-mint-detail {
        position: relative;
    }

    .mint-selection {
        padding: emRhythm(5) emRhythm(4);

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
</style>