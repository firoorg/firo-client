<template>
    <section class="mint-zerocoin">
        <div class="scrollable-height">
            <section class="mint-selection">
                <header>
                    <h1>
                        Mint<br>
                        Zcoin
                    </h1>
                    <p>
                        Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas faucibus mollis interdum.
                    </p>
                </header>

                <denomination-selector />
            </section>
        </div>
        <section class="current-mint-detail">
            <h2>Current Mints</h2>
        </section>
    </section>
</template>

<script>
    import DenominationSelector from '@/components/DenominationSelector'
    // import { mapGetters } from 'vuex'

    export default {
        name: 'MintZerocoinPage',
        components: {
            DenominationSelector
        },

        data () {
            return {
            }
        },

        computed: {
        },

        methods: {
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
            }
        }
    }

    .current-mint-detail {
        //background: $gradient--comet-dark-horizontal;
        //background: $gradient--polo-horizontal;
        background: $color--white;
    }
</style>