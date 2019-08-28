<i18n>
    en:
        heading: "Zcoin Balance"
</i18n>

<template>
    <section class="balance">
        <div class="confirmed-total">
            <amount :amount="availableXzc" /> <span class="ticker">XZC</span>
        </div>
        <div
            v-if="lockedXzc > 0 && pendingXzc > 0"
        >
            (+ <amount :amount="lockedXzc" /> locked, <amount :amount="pendingXzc" /> pending)
        </div>
        <div
            v-else-if="lockedXzc > 0"
        >
            (+ <amount :amount="lockedXzc" /> locked)
        </div>
        <div
            v-else-if="pendingXzc > 0"
        >
            (<amount :amount="pendingXzc" /> pending)
        </div>

        <div
            v-if="availableZerocoin > 0 && unconfirmedZerocoin > 0"
            class="zerocoin-total"
        >
            <amount :amount="availableZerocoin" /> <span class="ticker" title="Private XZC">ⓩ</span>
            (+ <amount :amount="unconfirmedZerocoin" /> pending)
        </div>
        <div
            v-else-if="availableZerocoin > 0"
            class="zerocoin-total"
        >
            <amount :amount="availableZerocoin" /> <span class="ticker" title="Private XZC">ⓩ</span>
        </div>
        <div
            v-else-if="unconfirmedZerocoin > 0"
            class="zerocoin-total"
        >
            (+ <amount :amount="unconfirmedZerocoin" /> <span class="ticker" title="Private XZC">ⓩ</span> pending)
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex' /* , mapActions */
import Amount from './Amount'

export default {
    name: 'Balance',

    components: {
        Amount
    },

    computed: {
        ...mapGetters({
            availableXzc: 'Balance/availableXzc',
            unconfirmedXzc: 'Balance/unconfirmedXzc',
            immatureXzc: 'Balance/immatureXzc',
            lockedXzc: 'Balance/lockedXzc',
            availableZerocoin: 'Balance/availableZerocoin',
            unconfirmedZerocoin: 'Balance/unconfirmedZerocoin'
        }),

        pendingXzc () {
            return this.immatureXzc + this.unconfirmedXzc
        }
    }
}
</script>

<style lang="scss" scoped>
    .balance {
        display: block;
        @include setType(3);

        margin-top: emRhythm(1);
        opacity: .8;
        transition: all .15s ease-in-out;
        //text-shadow: 0 0 10px $color--green-bright;
        cursor: default;
    }

    .pending-total {
        font-size-adjust: -80%;
        color: lightsalmon;
    }

    .balance {
        margin-top: emRhythm(0.69, $silent: true);
    }

    .ticker {
        color: #23B852;
    }
</style>
