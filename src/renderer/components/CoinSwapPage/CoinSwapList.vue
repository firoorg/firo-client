<template>
    <div class="coin-swap-list">
        <SearchInput v-model="filter" placeholder="Search by ticker, amount, or status" />

        <animated-table
            :data="filteredTableData"
            :fields="tableFields"
            track-by="orderId"
            no-data-message="No Swaps Made Yet"
            :sort-order="sortOrder"
            :compare-elements="comparePayments"
            :per-page="17"
            :on-page-change="pageNumber => currentPage = pageNumber"
            :on-row-select="(rowData) => selectedRow = rowData"
        />

        <Popup v-if="selectedRow">
            <CoinSwapInfo
                :coin-swap-data="selectedRow"
                :show-cancel="false"
                @confirm="selectedRow = null"
            />
        </Popup>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AnimatedTable from 'renderer/components/AnimatedTable/AnimatedTable';
import Popup from 'renderer/components/shared/Popup';
import AnimatedTableRelativeDate from "renderer/components/AnimatedTable/AnimatedTableRelativeDate";
import CoinSwapSendAmount from "renderer/components/AnimatedTable/CoinSwapSendAmount";
import CoinSwapReceivedAmount from "renderer/components/CoinSwapPage/CoinSwapReceivedAmount";
import CoinSwapStatus from "renderer/components/CoinSwapPage/CoinSwapStatus";
import CoinSwapInfo from "renderer/components/CoinSwapPage/CoinSwapInfo";
import SearchInput from "renderer/components/shared/SearchInput";

const tableFields = [
    {name: CoinSwapStatus, width: '40pt'},
    {name: AnimatedTableRelativeDate, width: '120pt'},
    {name: CoinSwapSendAmount},
    {name: CoinSwapReceivedAmount, width: '150pt'}
];

export default {
    name: 'CoinSwapList',

    components: {
        SearchInput,
        CoinSwapInfo,
        AnimatedTable,
        Popup
    },

    data() {
        return {
            tableFields,
            filter: '',
            currentPage: 1,
            selectedRow: null
        };
    },

    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            addresses: 'Transactions/addresses',
            consolidatedMints: 'Transactions/consolidatedMints',
            paymentRequests: 'PaymentRequest/paymentRequests',
            isBlockchainSynced: 'Blockchain/isBlockchainSynced',
            isReindexing: 'ApiStatus/isReindexing',
            coinSwapRecords: 'CoinSwap/records'
        }),

        tableData() {
            return Object.values(this.coinSwapRecords);
        },

        filteredTableData() {
            if (!this.filter) {
                return this.tableData;
            }

            let filter = this.filter.toLowerCase();
            return this.tableData.filter(tableRow =>
                ['fromCoin', 'toCoin', 'sentAmount', 'receiveAmount', 'fee', 'status', 'extraSearchText'].find(
                    key => tableRow[key] && tableRow[key].toLowerCase().indexOf(filter) !== -1
                )
            );
        },

        sortOrder() {
            return [
                {
                    sortField: 'date',
                    direction: 'desc'
                }
            ];
        }
    },

    methods: {
        comparePayments(a, b) {
            return !['id', 'fromCoin', 'toCoin', 'sentAmount', 'receiveAmount', 'fee', 'status'].find(field => a[field] !== b[field]);
        },

        cancel() {
            this.show = false;
        },
    }
};
</script>

<style lang="scss" scoped>
.coin-swap-list {
    height: 100%;
    padding: var(--padding-main);

    display: flex;
    flex-flow: column;

    .search-input {
        margin-bottom: var(--padding-main);
    }

    .animated-table {
        flex-grow: 1;
    }
}
</style>
