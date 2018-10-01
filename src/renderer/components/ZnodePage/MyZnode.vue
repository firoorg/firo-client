<template>
    <div class="znode">
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
                <main>
                    <!-- todo open issue -> timestamp in seconds -->
                    <timeago :datetime="lastSeen" :auto-update="30" />
                </main>
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
                <main>{{ payeeAddress }}</main>
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

<script>
    export default {
        name: 'MyZnode',

        props: {
            payeeAddress: {
                type: String,
                required: true
            },
            lastSeen: {
                type: Number,
                default: -1
            }
        }
    }
</script>

<style lang="scss" scoped>
    .znode {
        background: $color--polo-light;
        @include box-shadow-large();
        //@include glow-huge-box();
        @include glow-small-box();
        padding: emRhythm(5) emRhythm(3) emRhythm(5) emRhythm(4);

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
</style>
