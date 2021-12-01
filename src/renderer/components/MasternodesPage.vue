<template>
    <div class="masternodes-page">
        <div class="header">
            <SearchInput v-model="filter" placeholder="Filter by label, ip, or collateral address" />

            <div class="header-part show-all-masternodes">
                <div class="checkbox-field">
                    <input type="checkbox" v-model="showAllZnodes">
                    <label>Show All Masternodes</label>
                </div>
            </div>

            <div class="checkbox-field header-part">
                <label>Node Count: {{ Object.keys(masternodes).length }}</label>
            </div>

            <div class="checkbox-field header-part">
                <label>My Nodes: {{ myNodeCount }}</label>
            </div>
        </div>

        <div class="animated-table-container">
            <AnimatedTable
                :data="filteredTableData"
                :fields="tableFields"
                track-by="proTxHash"
                no-data-message="You don't have any Masternodes."
                :on-row-select="(rowData) => selectedMasternode = rowData"
            />
        </div>

        <Popup v-if="selectedMasternode">
            <MasternodeInfo
                :masternode="selectedMasternode"
                @ok="selectedMasternode = null"
            />
        </Popup>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import Popup from "renderer/components/shared/Popup";
import MasternodeInfo from "renderer/components/MasternodesPage/MasternodeInfo";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable";
import MasternodeCollateralAddress from "renderer/components/AnimatedTable/MasternodeCollateralAddress";
import MasternodeNextPaymentBlock from "renderer/components/AnimatedTable/MasternodeNextPaymentBlock";
import MasternodeIP from "renderer/components/AnimatedTable/MasternodeIP";
import SearchInput from "renderer/components/shared/SearchInput";

const tableFields = [
    {name: MasternodeIP, width: "160pt"},
    {name: MasternodeCollateralAddress},
    {name: MasternodeNextPaymentBlock, width: "160pt"}
];

export default {
    name: "MasternodesPage",

    components: {
        SearchInput,
        AnimatedTable,
        Popup,
        MasternodeInfo
    },

    data() {
        return {
            tableFields,
            filter: "",
            showAllZnodes: false,
            // We're intentionally not updating here because it's usually not very important and will mess up the UX
            // when it happens. The data will be refreshed when the user navigates away and then back to this page
            // anyway.
            masternodes: $store.getters['Masternode/masternodes'],
            selectedMasternode: null
        };
    },

    computed: {
        myNodeCount() {
            return Object.values(this.masternodes).filter(masternode => masternode.wallet.hasMasternode).length;
        },

        filteredTableData() {
            [this.filter, this.showAllZnodes];

            return Object.values(this.masternodes).filter(masternode => {
                if (!this.showAllZnodes && !masternode.wallet.hasMasternode) return false;
                if (!this.filter) return true;

                return !![
                    masternode.state.service,
                    masternode.proTxHash,
                    masternode.collateralHash,
                    masternode.collateralAddress,
                    masternode.state.ownerAddress,
                    masternode.state.votingAddress,
                    masternode.state.payoutAddress,
                    masternode.state.pubKeyOperator,
                    masternode.state.operatorPayoutAddress,
                    String(masternode.state.nextPaymentHeight),
                    masternode.state.status
                ].find(f => f && f.toLowerCase().includes(this.filter.toLowerCase()));
            }).sort((mnA, mnB) => {
                const a = mnA.state.nextPaymentHeight;
                const b = mnB.state.nextPaymentHeight;

                if (!a && !b) return 0;
                if (!a) return this.showAllZnodes ? 1 : -1;
                if (!b) return this.showAllZnodes ? -1 : 1;
                return a - b;
            })
        }
    }
};
</script>

<style lang="scss" scoped>

.masternodes-page {
    height: 100%;
    padding: var(--padding-base);

    display: flex;
    flex-flow: column;

    .header {
        margin-bottom: var(--padding-base);
        display: flex;

        .header-part {
            margin: {
                top: 11px;
                bottom: 11px;
                left: var(--padding-base);
            }

            &:not(:last-child) {
                padding-right: var(--padding-base);
                border-right: {
                    style: solid;
                    width: 1px;
                    color: var(--color-text-subtle-border);
                }
            }

            & > label {
                padding-left: 0;
            }

            width: fit-content;
            white-space: nowrap;
            vertical-align: middle;
        }
    }

    .animated-table-container {
        flex-grow: 1;

        .animated-table {
            height: 100%;
        }
    }
}
</style>