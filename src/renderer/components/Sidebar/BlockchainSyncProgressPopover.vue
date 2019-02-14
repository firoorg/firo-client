<template>
    <div class="blockchain-sync-progress-popover">
        <template v-if="!isBlockchainSynced">
            <h3>{{ $t('navigation.flyout-blockchain-sync-progress.title') }}</h3>
            <p>
                <i18n
                    path="navigation.flyout-blockchain-sync-progress.label__blocks-processed"
                    tag="span"
                >
                    <span place="blockAmount">
                        <strong>{{ currentBlockHeight }}</strong>
                    </span>
                </i18n>
                <i18n
                    path="navigation.flyout-blockchain-sync-progress.label__blocks-timestamp"
                    tag="span"
                >
                    <span place="blockTimeago">
                        <timeago
                            :datetime="currentBlockTimestamp * 1000"
                            :auto-update="10"
                        />
                    </span>
                </i18n>
                <!--
                <i18n path="navigation.flyout-blockchain-sync-progress.label__estimated-time-until-synced" tag="span">
                    <span place="estimatedTimestamp">
                        <timeago
                            :datetime="estimatedTimeUntilSynced"
                            :auto-update="30" />
                    </span>
                </i18n>
                -->
            </p>
            <p>
                <strong>{{ $t('navigation.flyout-blockchain-sync-progress.label__blocks-not-visible') }}</strong>
            </p>
        </template>
        <template v-else-if="!isZnodeListSynced">
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
            isZnodeListSynced: 'Blockchain/isZnodeListSynced'
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
