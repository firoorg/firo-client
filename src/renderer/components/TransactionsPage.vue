<template>
    <section class="transactions-page">
        <div class="inner">
            <div class="top-section">
                <SearchInput v-model="filter" placeholder="Filter by label or address" />

                <div v-if="showUnsyncedWarning" class="show-unsynced-warning">
                    The blockchain is not yet synced. Payment information may be incomplete or inaccurate.
                </div>

                <div v-if="newTableData.length" class="awaiting-updates">
                    New payments have arrived. <a @click="reloadTable">Click here</a> to load new transactions.
                </div>
            </div>

            <animated-table
                :data="filteredTableData"
                :fields="tableFields"
                track-by="id"
                :no-data-message="tableData.length ? 'No transactions matched your search criterion' : 'No Payments made yet.'"
                :sort-order="sortOrder"
                :compare-elements="comparePayments"
                :on-page-change="(pageNumber) => this.currentPage = pageNumber"
                :on-row-select="(rowData) => selectedTx = rowData"
            />
        </div>

        <Popup v-if="selectedTx">
            <TransactionInfo
                :tx="selectedTx"
                @ok="selectedTx = null"
            />
        </Popup>
    </section>
</template>

<script>
import {markRaw} from "vue";
import { mapGetters } from 'vuex';
import TransactionInfo from "renderer/components/TransactionsPage/TransactionInfo.vue";
import AnimatedTable from 'renderer/components/AnimatedTable/AnimatedTable.vue';
import RelativeDate from 'renderer/components/AnimatedTable/AnimatedTableRelativeDate.vue';
import Amount from 'renderer/components/AnimatedTable/AnimatedTableAmount.vue';
import Label from 'renderer/components/AnimatedTable/AnimatedTableLabel.vue';
import Popup from "renderer/components/shared/Popup.vue";
import { bigintToString } from "lib/convert";
import SearchInput from "renderer/components/shared/SearchInput.vue";

const tableFields = [
    {name: markRaw(RelativeDate), width: '160pt'},
    {name: markRaw(Label)},
    {name: markRaw(Amount), width: '160pt'}
];

export default {
    name: 'TransactionsPage',

    components: {
        SearchInput,
        AnimatedTable,
        Popup,
        TransactionInfo
    },

    data () {
        return {
            tableFields,
            filter: '',
            tableData: [],
            newTableData: [],
            currentPage: 1,
            selectedTx: null
        }
    },

    watch: {
        latestTableData: {
            immediate: true,

            handler() {
                this.newTableData = this.latestTableData;
                if (this.currentPage === 1) {
                    this.reloadTable();
                }
            }
        },

        filteredTableData() {
            this.$nextTick(() => window.dispatchEvent(new Event('resize')));
        },

        showUnsyncedWarning() {
            this.$nextTick(() => window.dispatchEvent(new Event('resize')));
        }
    },

    computed: {
        ...mapGetters({
            userVisibleTransactions: 'Transactions/userVisibleTransactions',
            addressBook: 'AddressBook/addressBook',
            isBlockchainSynced: 'ApiStatus/isBlockchainSynced',
            isReindexing: 'ApiStatus/isReindexing'
        }),

        showUnsyncedWarning() {
            return !this.isBlockchainSynced || this.isReindexing;
        },

        latestTableData () {
            return this.userVisibleTransactions.map(txo => {
                let label;
                if (txo.txoLabel)
                    label = txo.txoLabel;
                else if (txo.elysium && this.addressBook[txo.elysium.destination])
                    label = this.addressBook[txo.elysium.destination].label;
                else if (txo.elysium && txo.elysium.destination)
                    label = txo.elysium.destination;
                else if (txo.elysium)
                    label = 'Elysium Transaction';
                else if (txo.sparkMemo)
                    label = txo.sparkMemo;
                else if (txo.scriptType == 'lelantus-mint')
                    label = 'Lelantus Mint';
                else if (this.addressBook[txo.destination]?.label)
                    label = this.addressBook[txo.destination].label;
                else if (txo.destination)
                    label = txo.destination;
                else if (txo.isFromMe && txo.isToMe && txo.scriptType == 'spark-mint')
                    label = 'Spark Mint';
                else if (['spark-smint', 'spark-spend'].includes(txo.scriptType))
                    label = 'Spark Spend';
                else if (['pay-to-public-key', 'pay-to-public-key-hash'].includes(txo.scriptType))
                    label = 'Public Transaction';
                else if (txo.scriptType == 'pay-to-exchange-address')
                    label = 'Exchange Transaction';
                else
                    label = 'Firo Transaction';

                return {
                    id: `${txo.blockHash}-${txo.txid}-${txo.index}-${JSON.stringify(label)}`,
                    label,
                    extraSearchText:
                        `${txo.isFromMe && !txo.isToMe ? '-' : ''}${!txo.isFromMe && txo.isToMe ? '+' : ''}${bigintToString(txo.amount)}` + '\0' +
                        (txo.elysium ? ` elysium\0${txo.elysium.sender}\0${txo.elysium.receiver}\0${txo.elysium.amount}\0${txo.elysium.property?.name}` : '') + '\0' +
                        `${txo.blockHeight || 'Unconfirmed'}` + '\0' +
                        label,
                    ...txo
                };
            });
        },

        filteredTableData () {
            if (!this.filter) {
                return this.tableData;
            }

            let filter = this.filter.toLowerCase();
            return this.tableData.filter(tableRow =>
                ['label', 'address', 'extraSearchText', 'txid'].find(key =>
                    tableRow[key] && tableRow[key].toLowerCase().indexOf(filter) !== -1
                )
            )
        },

        sortOrder () {
            return [
                {
                    sortField: 'firstSeenAt',
                    direction: 'desc'
                }
            ]
        }
    },

    methods: {
        comparePayments: (a, b) => a.id === b.id,

        reloadTable() {
            this.tableData = this.newTableData;
            this.newTableData = [];
        }
    }
}
</script>

<style lang="scss" scoped>
.transactions-page {
    height: 100%;

    .inner {
        height: 100%;
        padding: var(--padding-base);

        display: flex;
        flex-flow: column;

        .top-section {
            .search-input {
                margin-bottom: var(--padding-base);
            }

            .show-unsynced-warning, .awaiting-updates {
                text-align: center;
                font-weight: var(--font-weight-bold);

                margin-bottom: var(--padding-base);
            }
        }

        .animated-table {
            flex-grow: 1;
        }
    }
}
</style>
