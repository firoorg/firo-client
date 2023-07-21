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
import {markRaw} from "vue";
import { mapGetters } from 'vuex';
import AnimatedTable from 'renderer/components/AnimatedTable/AnimatedTable.vue';
import Popup from 'renderer/components/shared/Popup.vue';
import AnimatedTableRelativeDate from "renderer/components/AnimatedTable/AnimatedTableRelativeDate.vue";
import CoinSwapSendAmount from "renderer/components/CoinSwapPage/CoinSwapSendAmount.vue";
import CoinSwapReceivedAmount from "renderer/components/CoinSwapPage/CoinSwapReceivedAmount.vue";
import CoinSwapStatus from "renderer/components/CoinSwapPage/CoinSwapStatus.vue";
import CoinSwapInfo from "renderer/components/CoinSwapPage/CoinSwapInfo.vue";
import SearchInput from "renderer/components/shared/SearchInput.vue";

const tableFields = [
    {name: markRaw(CoinSwapStatus), width: '60pt'},
    {name: markRaw(AnimatedTableRelativeDate), width: '150pt'},
    {name: markRaw(CoinSwapSendAmount)},
    {name: markRaw(CoinSwapReceivedAmount), width: '150pt'}
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
                ['date', 'fromCoin', 'toCoin', 'sentAmount', 'receiveAmount', 'fee', 'status', 'extraSearchText'].find(
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
    padding: var(--padding-base);

    display: flex;
    flex-flow: column;

    .search-input {
        margin-bottom: var(--padding-base);
    }

    .animated-table {
        flex-grow: 1;
    }
}
</style>
