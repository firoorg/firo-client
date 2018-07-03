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

                <denomination-selector />
            </section>
        </div>
        <section class="current-mint-detail scrollable-height">

                <section class="current-mint">
                    <h2>Create Mint</h2>
                    <current-mints :current-mints="currentMints" />
                </section>
                <form class="checkout" :submit.prevent="onSubmit">
                    <div class="has-divider">
                        <fees-and-amount :fee="{ label: 'Fees', amount: totalMintFee }" :amount="currentMintCost" />
                    </div>
                    <base-button color="green"
                                 class="submit"
                                 :disabled="!canSubmit"
                                 @click.prevent="onSubmit"
                                 type="submit">
                        Start Minting
                    </base-button>
                </form>
        </section>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'

    import DenominationSelector from '@/components/DenominationSelector'
    import CurrentMints from '@/components/MintZerocoinPage/CurrentMints'
    import FeesAndAmount from '@/components/FeesAndAmount'

    export default {
        name: 'MintZerocoinPage',
        components: {
            FeesAndAmount,
            CurrentMints,
            DenominationSelector
        },

        data () {
            return {
            }
        },

        computed: {
            ...mapGetters({
                denominations: 'Mint/currentDenominations'
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

            currentMintCost () {
                return this.currentMints.reduce((accumulator, current) => accumulator + current.cost, 0)
            },

            totalMintFee () {
                return this.currentMints.reduce((accumulator, current) => accumulator + current.amount, 0) / 1000
            },

            canSubmit () {
                return true
            }
        },

        methods: {
            onSubmit () {
                console.log('start minting')
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

    }
</style>