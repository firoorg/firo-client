<template>
    <section class="balances">
        <div class="balance private">
            <label>Balance:</label>
            <amount :amount="availablePrivate" ticker="FIRO" />
        </div>

        <div v-if="locked > 0" class="balance locked">
            <label>Locked:</label>
            <amount :amount="locked" ticker="FIRO" />
        </div>

        <div v-if="availablePublic > 0" class="balance public">
            <label>Public:</label>
            <amount :amount="availablePublic" ticker="FIRO" />
        </div>

        <div v-if="incoming > 0" class="balance incoming">
            <label>Incoming:</label>
            <amount :amount="incoming" ticker="FIRO" />
        </div>

        <div v-if="pendingChange > 0" class="balance pending">
            <label>Pending Change:</label>
            <amount :amount="pendingChange" ticker="FIRO" />
        </div>

        <div v-if="immature > 0" class="balance immature">
            <label>Immature:</label>
            <amount :amount="immature" ticker="FIRO" />
        </div>

        <div v-if="pendingConversion > 0" class="balance pending-conversion">
            <label>Pending Conversion:</label>
            <amount :amount="pendingConversion" ticker="FIRO" />
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
import Amount from 'renderer/components/shared/Amount'

export default {
    name: 'Balance',

    components: {
        Amount
    },

    data () {
        return {
            availableSparkFiro: 0
        }
    },

    computed: {
        ...mapGetters({
            availablePrivate: 'Balance/availablePrivate',
            locked: 'Balance/locked',
            availablePublic: 'Balance/availablePublic',
            incoming: 'Balance/incoming',
            pendingChange: 'Balance/pendingChange',
            immature: 'Balance/immature',
            pendingConversion: 'Balance/pendingConversion'
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
            font-weight: var(--font-weight-bold);
            color: var(--color-primary);
        }
    }
}
</style>
