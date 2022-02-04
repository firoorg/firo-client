<template>
    <section class="transactions-page">
        <div class="inner">
            <div class="top-section">
                <SearchInput v-model="filter" placeholder="Filter by label or address" />

                <div v-if="showUnsyncedWarning" class="show-unsynced-warning">
                    The blockchain is not yet synced. Payment information may be incomplete or inaccurate.
                </div>

                <div v-if="newTableData.length" class="awaiting-updates">
                    New payments have arrived. <a href='#' @click="reloadTable">Click here</a> to load new transactions.
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
import { mapGetters } from 'vuex';
import TransactionInfo from "renderer/components/TransactionsPage/TransactionInfo";
import AnimatedTable from 'renderer/components/AnimatedTable/AnimatedTable';
import RelativeDate from 'renderer/components/AnimatedTable/AnimatedTableRelativeDate';
import Amount from 'renderer/components/AnimatedTable/AnimatedTableAmount';
import Label from 'renderer/components/AnimatedTable/AnimatedTableLabel';
import Popup from "renderer/components/shared/Popup";
import { convertToCoin } from "lib/convert";
import SearchInput from "renderer/components/shared/SearchInput";

const tableFields = [
    {name: RelativeDate, width: '160pt'},
    {name: Label},
    {name: Amount, width: '160pt'}
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
            const tableData = [];

            for (const txo of this.userVisibleTransactions) {
                tableData.push({
                    id: `${txo.blockHash}-${txo.txid}-${txo.index}`,
                    label: (this.addressBook[txo.destination] || {}).label || txo.destination,
                    extraSearchText:
                        `${txo.isFromMe ? '-' : '+'}${convertToCoin(txo.amount)}` + '\0' +
                        (txo.elysium ? ` elysium ${txo.elysium.sender} ${txo.elysium.receiver} ${txo.elysium.amount} ${txo.elysium.property && txo.elysium.property.name}` : '') + '\0' +
                        `${txo.blockHeight || 'Unconfirmed'}`,
                    ...txo
                });
            }

            return tableData;
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
                font-weight: bold;

                margin-bottom: var(--padding-base);
            }
        }

        .animated-table {
            flex-grow: 1;
        }
    }
}
</style>
