<i18n>
    en:
        heading: "Zcoin Balance"
</i18n>

<template>
    <section class="balance">
        <div>
            <amount :amount="availableXzc" />&nbsp;<span class="ticker">XZC</span>
        </div>
        <div v-if="lockedXzc > 0">
            +&nbsp;<amount :amount="lockedXzc" />&nbsp;<span class="ticker">XZC</span>&nbsp;locked
        </div>
        <div v-if="pendingXzc > 0">
            +&nbsp;<amount :amount="pendingXzc" />&nbsp;<span class="ticker">XZC</span>&nbsp;pending
        </div>

        <div>
            <amount :amount="availableZerocoin" />&nbsp;<span class="ticker" title="Private XZC">ⓩ</span>
        </div>
        <div v-if="unconfirmedZerocoin > 0">
            +&nbsp;<amount :amount="unconfirmedZerocoin" />&nbsp;<span class="ticker" title="Private XZC">ⓩ</span>&nbsp;pending
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

    margin: {
        right: 1em;
        left: 1em;
    }
    text-align: right;

    .ticker {
        color: #23B852;
    }
}
</style>
