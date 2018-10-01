<template>
    <section class="znode-page">
        <div class="scrollable-height">
            <div class="znode-page-inner">
                <section class="title-bar">
                    <header>
                        <h1>Znodes</h1>
                        <p>Integer posuere erat a ante venenatis dapibus velit aliquet. Etiam porta sem magna mollis euismod.</p>
                    </header>

                    <form>
                        <input type="text" placeholder="Search for xxx">
                    </form>
                </section>

                <section class="stats">
                    <div class="stat">
                        <div class="value">3402</div>
                        <div class="desc">Total Nodes</div>
                    </div>
                    <div class="stat">
                        <div class="value">24.82</div>
                        <div class="desc">Avgerage Days for Payout</div>
                    </div>
                    <div class="stat">
                        <div class="value">17.23</div>
                        <div class="desc">days until your next Payout</div>
                    </div>
                </section>

                <section class="my-znodes">
                    <my-znode v-for="(znode, index) in myZnodes"
                              :key="index"
                              v-bind="znode"  />
                </section>
            </div>
        </div>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    // import types from '~/types'

    import MyZnode from '@/components/ZnodePage/MyZnode'

    export default {
        name: 'ZnodePage',

        components: {
            MyZnode
        },

        computed: {
            ...mapGetters({
                myZnodes: 'Znode/myZnodes'
            })
        }
    }
</script>

<style lang="scss" scoped>
    .znode-page {
        //display: grid;
        box-sizing: border-box;
        //grid-template-columns: 3fr  minmax(30rem, 2fr);
        background: $color--private;
        padding-right: 6.25rem;

        & > .scrollable-height {
            @include scrollbar-on-hover($color--comet-dark-mixed);
        }
    }

    .znode-page-inner {
        background: $color--private;
        padding: emRhythm(5) emRhythm(3) emRhythm(5) emRhythm(4);
    }

    .title-bar {
        display: flex;
        justify-content: space-between;

        header {
            display: flex;
            align-items: center;
            margin-bottom: emRhythm(7);

            h1 {
                margin-bottom: 0;
                color: $color--polo-light;
            }

            p {
                @include description(emRhythm(45));
                margin-left: emRhythm(4);
                color: $color--polo;
            }
        }

        form {

        }
    }

    .stats {
        display: flex;
        justify-content: space-evenly;
        margin-bottom: emRhythm(7);

        .stat {
            max-width: 15rem;

            .value {
                @include font-black();
                @include setType(4, $ms-up2);
                margin: 0;
                text-align: center;
                color: $color--polo-light;
            }

            .desc {
                @include font-medium();
                font-style: italic;
                color: $color--polo;
            }
        }
    }

    .my-znodes {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-column-gap: emRhythm(4);
        grid-row-gap: emRhythm(6);
    }

    footer {
        margin-top: emRhythm(6);
        text-align: right;

        button + button {
            margin-left: emRhythm(2);
        }
    }
</style>
