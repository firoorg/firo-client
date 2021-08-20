<template>
    <div class="info-popup">
        <div class="title">
            Masternode Information
        </div>

        <table>
            <tr>
                <td>Status</td>
                <td>{{ masternode.state.status || 'SYNCING' }}</td>
            </tr>

            <tr>
                <td>Pro Tx Hash</td>
                <td>{{ masternode.proTxHash }}</td>
            </tr>

            <tr>
                <td>Collateral Output</td>
                <td>{{ masternode.collateralHash }}-{{ masternode.collateralIndex }}</td>
            </tr>

            <tr>
                <td>Operator Reward</td>
                <td>{{ masternode.operatorReward }}</td>
            </tr>

            <tr>
                <td>IP:port</td>
                <td>{{ masternode.state.service }}</td>
            </tr>

            <tr>
                <td>Registered At Block #</td>
                <td>{{ masternode.state.registeredHeight }}</td>
            </tr>

            <tr>
                <td>Last Paid At Block #</td>
                <td>{{ masternode.state.lastPaidHeight }}</td>
            </tr>

            <tr>
                <td>Next Payment At Block #</td>
                <td>{{ masternode.state.nextPaymentHeight }}</td>
            </tr>

            <template v-if="masternode.state.PoSePenalty">
                <tr>
                    <td>PoSe Penalty</td>
                    <td>{{ masternode.state.PoSePenalty }}</td>
                </tr>

                <tr>
                    <td>PoSe Revived Height</td>
                    <td>{{ masternode.state.PoSeRevivedHeight }}</td>
                </tr>

                <tr>
                    <td>PoSe Ban Height</td>
                    <td>{{ masternode.state.PoSeBanHeight }}</td>
                </tr>

                <tr>
                    <td>Revocation Reason</td>
                    <td>{{ masternode.state.revocationReason }}</td>
                </tr>
            </template>

            <tr>
                <td>Owner Address</td>
                <td>{{ masternode.state.ownerAddress }}</td>
            </tr>

            <tr>
                <td>Voting Address</td>
                <td>{{ masternode.state.votingAddress }}</td>
            </tr>

            <tr>
                <td>Payout Address</td>
                <td>{{ masternode.state.payoutAddress }}</td>
            </tr>

            <tr>
                <td>PubKey Operator</td>
                <td>{{ masternode.state.pubKeyOperator }}</td>
            </tr>

            <tr v-if="masternode.state.operatorPayoutAddress">
                <td>Operator Payout Address</td>
                <td>{{ masternode.state.operatorPayoutAddress }}</td>
            </tr>
        </table>

        <div class="buttons">
            <button class="solid-button recommended" @click="$emit('ok')">
                OK
            </button>
        </div>
    </div>
</template>

<script>
// $emits: ok

export default {
    name: "MasternodeInfo",

    props: {
        // This is a MasternodeEvent from src/daemon/firod.ts
        masternode: Object
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";
</style>