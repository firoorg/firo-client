<template>
    <section class="balance">
        <div>
            <amount :amount="available" ticker="FIRO" />
        </div>

        <div v-if="locked > 0" class="locked">
            +&nbsp;<amount :amount="locked" ticker="locked" />
        </div>

        <div v-if="availablePublic > 0" class="public">
            +&nbsp;<amount :amount="availablePublic" ticker="public" />
        </div>

        <div v-if="(pending + immature) > 0" class="pending">
            +&nbsp;<amount :amount="pending + immature" ticker="pending" />
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex' /* , mapActions */
import Amount from 'renderer/components/shared/Amount'

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
            pending: 'Balance/pending',
            immature: 'Balance/immature'
        })
    }
}
</script>

<style lang="scss" scoped>
@import "src/renderer/styles/sizes";

.balance {
    opacity: 0.8;
    text-align: right;
    margin: {
        top: $size-small-space;
        right: $size-small-space;
    }

    .locked, .public, .pending {
        opacity: 0.6;
    }
}
</style>
