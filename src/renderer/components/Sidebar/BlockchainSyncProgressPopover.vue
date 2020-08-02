<template>
    <div class="blockchain-sync-progress-popover">
        <template v-if="!isBlockchainSynced">
            <h3>{{ $t('navigation.flyout-blockchain-sync-progress.title') }}</h3>
            <p>
                <span>
                    <strong>Proceaaed {{ currentBlockHeight }} blocks of transaction history so far.</strong>
                </span>

                <span>
                  The last block received was generated
                  <timeago :datetime="currentBlockTimestamp * 1000" :auto-update="10" />.
                </span>
            </p>
            <p>
                <strong>{{ $t('navigation.flyout-blockchain-sync-progress.label__blocks-not-visible') }}</strong>
            </p>
        </template>
        <template v-else-if="!isWinnersListSynced">
            <h3>{{ $t('navigation.flyout-znode-sync-progress.title') }}</h3>
            <p>{{ $t('navigation.flyout-znode-sync-progress.label') }}</p>
        </template>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'BlockchainSyncProgressPopover',
    computed: {
        ...mapGetters({
            currentBlockHeight: 'Blockchain/currentBlockHeight',
            currentBlockTimestamp: 'Blockchain/currentBlockTimestamp',
            estimatedTimeUntilSynced: 'Blockchain/estimatedTimeUntilSynced',
            isBlockchainSynced: 'Blockchain/isBlockchainSynced',
            isWinnersListSynced: 'Blockchain/isWinnersListSynced'
        })
    }
}
</script>

<style lang="scss" scoped>
    h3 {
        margin-top: 0;
    }

    p:last-child {
        margin-bottom: 0;
    }

    .blockchain-sync-progress-popover {
        max-width: emRhythm(50);
    }
</style>
