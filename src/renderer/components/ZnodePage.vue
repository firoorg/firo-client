<template>
    <section class="znode-page">
        <div class="scrollable-height">
            <div class="znode">
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
                    <template v-for="index in 4">
                        <div class="znode" :key="index">
                            <header>
                                <h2>My Znode Name</h2>
                            </header>

                            <div class="znode-stats">
                                <section class="status">
                                    <header>Status</header>
                                    <main>Enabled</main>
                                </section>
                                <section class="last-seen">
                                    <header>Last Seen</header>
                                    <main>16 minutes ago</main>
                                </section>
                                <section class="active-since">
                                    <header>Active since</header>
                                    <main>67 days</main>
                                </section>
                                <section class="next-payout"></section>
                                <section class="last-payout"></section>
                                <section class="received"></section>
                                <section class="payee">
                                    <header>Payee</header>
                                    <main>TFywBRRpLr3dy2kh9tkf1RwBEsMx3k7BwJ</main>
                                </section>
                            </div>

                            <footer>
                                <base-button :is-outline="true">
                                    Other
                                </base-button>
                                <base-button color="comet">
                                    Action Name
                                </base-button>
                            </footer>
                        </div>
                    </template>
                </section>
            </div>
        </div>
    </section>
</template>

<script>
    export default {
        name: 'ZnodePage'
    }
</script>

<style lang="scss" scoped>
    .znode-page {
        //display: grid;
        box-sizing: border-box;
        //grid-template-columns: 3fr  minmax(30rem, 2fr);
        background: $color--private;
    }

    .znode {
        padding: emRhythm(5) emRhythm(4);
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

        .znode {
            background: $color--polo-light;
            @include box-shadow-large();
            //@include glow-huge-box();
            @include glow-small-box();

            .znode-stats {
                display: grid;
                grid-template-areas: "status last-seen active-since"
                                     "next-payout last-payout received"
                                     "payee payee payee";
                grid-column-gap: emRhythm(1);
                grid-row-gap: emRhythm(1);

                header {
                    @include font-medium();
                    font-style: italic;
                    color: $color--comet;
                }

                .status { grid-area: status; }
                .last-seen { grid-area: last-seen; }
                .active-since { grid-area: active-since; }
                .next-payout { grid-area: next-payout; }
                .last-payout { grid-area: last-payout; }
                .received { grid-area: received; }
                .payee { grid-area: payee; }
            }
        }
    }

    footer {
        margin-top: emRhythm(6);
        text-align: right;

        button + button {
            margin-left: emRhythm(2);
        }
    }
</style>
