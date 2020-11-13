<template>
    <section class="balance">
        <div>
            <amount :amount="available" />&nbsp;<span class="ticker">FIRO</span>
        </div>

        <div v-if="locked > 0" class="locked">
            +&nbsp;<amount :amount="locked" />&nbsp;locked
        </div>

        <div v-if="availablePublic > 0" class="public">
            +&nbsp;<amount :amount="availablePublic" />&nbsp;public
        </div>

        <div v-if="pending > 0" class="pending">
            +&nbsp;<amount :amount="pending" />&nbsp;pending
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
            available: 'Balance/available',
            locked: 'Balance/locked',
            availablePublic: 'Balance/availablePublic',
            pending: 'Balance/pending'
        })
    }
}
</script>

<style lang="scss" scoped>
@import "src/renderer/styles/typography";

.balance {
    opacity: 0.8;
    text-align: right;
    margin: {
        top: $size-small-space;
        right: $size-small-space;
    }

    .ticker {
        @include ticker();
    }

    .locked, .public, .pending {
        opacity: 0.6;
    }
}
</style>
