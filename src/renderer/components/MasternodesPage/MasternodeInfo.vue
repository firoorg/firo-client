<template>
    <div>
        <div class="title">
            Masternode Information
        </div>

        <div class="content">
            <div class="fields">
                <div class="field">
                    <label>
                        Pro Tx Hash
                    </label>

                    <div class="value">
                        {{ masternode.proTxHash }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Collateral Output
                    </label>

                    <div class="value">
                        {{ masternode.collateralHash }}-{{ masternode.collateralIndex }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Operator Reward
                    </label>

                    <div class="value">
                        {{ masternode.operatorReward }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        IP:port
                    </label>

                    <div class="value">
                        {{ masternode.state.service }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Registered At Block #
                    </label>

                    <div class="value">
                        {{ masternode.state.registeredHeight }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Last Paid At Block #
                    </label>

                    <div class="value">
                        {{ masternode.state.lastPaidHeight }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Next Payment At Block #
                    </label>

                    <div class="value">
                        {{ masternode.state.nextPaymentHeight }}
                    </div>
                </div>

                <template v-if="masternode.state.PoSePenalty">
                    <div class="field">
                        <label>
                            PoSe Penalty
                        </label>

                        <div class="value">
                            {{ masternode.state.PoSePenalty }}
                        </div>
                    </div>

                    <div class="field">
                        <label>
                            PoSe Revived Height
                        </label>

                        <div class="value">
                            {{ masternode.state.PoSeRevivedHeight }}
                        </div>
                    </div>

                    <div class="field">
                        <label>
                            PoSe Ban Height
                        </label>

                        <div class="value">
                            {{ masternode.state.PoSeBanHeight }}
                        </div>
                    </div>

                    <div class="field">
                        <label>
                            Revocation Reason
                        </label>

                        <div class="value">
                            {{ masternode.state.revocationReason }}
                        </div>
                    </div>
                </template>

                <div class="field">
                    <label>
                        Owner Address
                    </label>

                    <div class="value">
                        {{ masternode.state.ownerAddress }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Voting Address
                    </label>

                    <div class="value">
                        {{ masternode.state.votingAddress }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        Payout Address
                    </label>

                    <div class="value">
                        {{ masternode.state.payoutAddress }}
                    </div>
                </div>

                <div class="field">
                    <label>
                        PubKey Operator
                    </label>

                    <div class="value">
                        {{ masternode.state.pubKeyOperator }}
                    </div>
                </div>

                <div v-if="masternode.state.operatorPayoutAddress" class="field">
                    <label>
                        Operator Payout Address
                    </label>

                    <div class="value">
                        {{ masternode.state.operatorPayoutAddress }}
                    </div>
                </div>
            </div>
        </div>

        <div class="buttons">
            <button @click="$emit('ok')">
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
        masternode: {
            type: Object,
            required: true
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";

@include info-popup();
</style>