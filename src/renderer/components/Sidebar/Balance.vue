<template>
    <section class="balances">
        <div class="balance private">
            <label>Balance:</label>
            <amount :amount="available" ticker="FIRO" />
        </div>

        <div v-if="locked > 0" class="balance locked">
            <label>Locked:</label>
            <amount :amount="locked" ticker="FIRO" />
        </div>

        <div v-if="availablePublic > 0" class="balance public">
            <label>Public:</label>
            <amount :amount="availablePublic" ticker="FIRO" />
        </div>

        <div v-if="(pending + immature) > 0" class="balance pending">
            <label>Pending:</label>
            <amount :amount="pending + immature" ticker="FIRO" />
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
.balances {
    user-select: text;

    .balance {
        opacity: 0.5;
        &.private { opacity: 1; }

        display: flex;
        justify-content: space-between;

        margin: {
            top: 5px;
            bottom: 5px;
        }

        label {
            font-weight: bold;
            color: var(--color-primary);
        }
    }
}
</style>
