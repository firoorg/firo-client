<template>
    <section class="mint-info">
        <div class="title">
            Private Mint
        </div>

        <div class="details">
            <div class="amount">
                {{ convertToCoin(amount) }} XZC
            </div>
        </div>

        <div class="privacy-message">
            Minting allows you to privately spend your funds at a later date.
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex';
import { convertToCoin } from "#/lib/convert";

export default {
    name: "TransactionInfo",

    computed: {
        ...mapGetters({
            consolidatedMints: 'Transactions/consolidatedMints'
        }),

        blockHeight () {
            return this.$route.params.blockHeight || throw 'unspecified blockHeight';
        },

        amount () {
            return this.consolidatedMints[this.blockHeight].totalMintAmount;
        }
    },

    methods: {
        convertToCoin
    }
}
</script>

<style scoped lang="scss">
.mint-info {
    height: 100%;
    background: $color--comet-light;
    color: $color--comet-dark;

    padding: {
        top: 2em;
        left: 2em;
        right: 2em;
    }

    font-size: 1.5em;

    .title {
        font-size: 2em;
    }

    .details {
        @include detail-header();

        .amount {
            font-size: 1.5em;
            text-align: right;
        }
    }

    .privacy-message {
        text-align: center;
        font-style: italic;
    }
}
</style>