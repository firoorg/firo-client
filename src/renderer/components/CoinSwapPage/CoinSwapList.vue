<template>
    <section class="coin-swap-page">
        <div class="inner">
            <div class="top-section">
                <input
                    v-model="filter"
                    type="text"
                    class="table-filter-input"
                    placeholder="Filter"
                />
            </div>

            <animated-table
                :data="filteredTableData"
                :fields="tableFields"
                track-by="id"
                no-data-message="No Swaps Made Yet"
                :sort-order="sortOrder"
                :compare-elements="comparePayments"
                :per-page="17"
                :on-page-change="pageNumber => currentPage = pageNumber"
                :on-row-select="(rowData) => selectedRow = rowData"
            />
        </div>

        <Popup v-if="selectedRow">
            <CoinSwapInfo
                :coin-swap-data="selectedRow"
                :show-cancel="false"
                @confirm="selectedRow = null"
            />
        </Popup>
    </section>
</template>

<script>
import { mapGetters } from 'vuex';
import AnimatedTable from 'renderer/components/AnimatedTable/AnimatedTable';
import Popup from '../Popup';
import AnimatedTableRelativeDate from "renderer/components/AnimatedTable/AnimatedTableRelativeDate";
import CoinSwapSendAmount from "renderer/components/AnimatedTable/CoinSwapSendAmount";
import CoinSwapReceivedAmount from "renderer/components/CoinSwapPage/CoinSwapReceivedAmount";
import CoinSwapStatus from "renderer/components/CoinSwapPage/CoinSwapStatus";
import CoinSwapInfo from "renderer/components/CoinSwapPage/CoinSwapInfo";

const tableFields = [
    {
        name: CoinSwapStatus,
        width: '10%'
    },

    {
        name: AnimatedTableRelativeDate,
        width: '30%'
    },

    {
        name: CoinSwapSendAmount,
        width: '30%'
    },

    {
        name: CoinSwapReceivedAmount,
        width: '30%'
    }
];

export default {
    name: 'CoinSwapList',

    components: {
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
@import "src/renderer/styles/inputs";
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/colors";

.coin-swap-page {
    height: 100%;

    .inner {
        box-sizing: border-box;
        height: 100%;

        display: flex;
        flex-flow: column;

        .top-section {
            height: fit-content;

            .table-filter-input {
                margin: {
                    top: $size-small-space;
                    left: auto;
                    right: 0;
                    bottom: $size-medium-space;
                }

                @include wide-input-field();
                max-width: 100%;
            }

            .filter-input {
                position: relative;
                display: inline-block;
            }

            .show-unsynced-warning, .awaiting-updates {
                text-align: center;
                font: {
                    size: 0.9em;
                    style: italic;
                    weight: bold;
                }

                margin-bottom: 1em;
            }

            .show-unsynced-warning {
                color: red;
            }
        }

        .animated-table {
            flex-grow: 1;
        }
    }
}
</style>
