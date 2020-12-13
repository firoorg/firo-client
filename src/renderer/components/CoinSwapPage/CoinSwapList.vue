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
                no-data-message="No coin swaps made yet."
                :sort-order="sortOrder"
                :compare-elements="comparePayments"
                :per-page="17"
                :on-page-change="pageNumber => (this.currentPage = pageNumber)"
                :on-row-select="onRowSelect"
            />
        </div>
        <Popup v-if="show">
            <QRCodeStep v-if="show" :orderID="orderID" :address="exchangeAddress" :amount="amount" :selectedCoin="selectedCoin" @cancel="cancel()" />
        </Popup>
    </section>
</template>

<script>
import { mapGetters } from 'vuex';

import AnimatedTable from 'renderer/components/AnimatedTable/AnimatedTable';
import RelativeDate from 'renderer/components/AnimatedTable/AnimatedTableRelativeDate';
import Amount from 'renderer/components/AnimatedTable/AnimatedTableAmount';
import PaymentStatus from 'renderer/components/AnimatedTable/AnimatedTablePaymentStatus';
import Label from 'renderer/components/AnimatedTable/AnimatedTableLabel';
import QRCodeStep from 'renderer/components/CoinSwapPage/QRCodeStep';
import Popup from '../Popup';

import { convertToCoin } from 'lib/convert';
import TIR from 'lib/tir';
import APIWorker from 'renderer/api/switchain-api';
import { statuses, finishedStatuses } from 'renderer/utils/constants';
import Utils from 'renderer/utils';
import { getEventBus } from 'renderer/utils/eventBus';

const EventBus = getEventBus("coin-swap");

const tableFields = [
    {
        name: 'orderId',
        sortField: 'orderId',
        title: 'Order ID',
        width: '30%',
        formatter: (value, { tableData }) => {
            let obj = tableData.find(val => val.id === value);

            if (obj?.toCoin === "FIRO" && obj?.status === "waiting") {
                return `<div style="color: #207ebc">
                    ${value}
                </div>`;
            }

            return value;
        }
    },
    {
        name: 'pair',
        sortField: 'pair',
        title: 'Pair',
        width: '10%'
    },
    {
        name: 'sentAmount',
        sortField: 'sentAmount',
        title: 'Sent',
        width: '10%'
    },
    {
        name: 'receivedAmount',
        sortField: 'receivedAmount',
        title: 'Received',
        width: '12%'
    },
    {
        name: 'fee',
        sortField: 'fee',
        title: 'Fee',
        width: '8%'
    },
    {
        name: 'status',
        sortField: 'status',
        title: 'Status',
        width: '10%'
    },
    {
        name: 'date',
        sortField: 'date',
        title: 'Date',
        width: '20%',
        formatter: value => `${Utils.dateFormat(value)}`
    }
];

export default {
    name: 'CoinSwapList',

    components: {
        AnimatedTable,
        Popup,
        QRCodeStep
    },

    data() {
        return {
            TIR: new TIR('coin-swap'),
            tableFields,
            filter: '',
            tableData: [],
            currentPage: 1,
            statusWatcher: {},
            show: false,
            orderID: '',
            exchangeAddress: '',
            amount: 0,
            selectedCoin: '',
        };
    },

    watch: {
        $route(to, from) {
            if (to.path === '/coin-swap') {
                this.initialize();
            } else {
                this.resetTimers();
            }
        }
    },

    created() {
        this.api = new APIWorker();
    },

    mounted() {
        this.initialize();
        EventBus.$on('refresh-table', this.refreshTable);
    },

    beforeDestroy() {
        EventBus.$off('refresh-table', this.refreshTable);
        this.resetTimers();
    },

    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            addresses: 'Transactions/addresses',
            consolidatedMints: 'Transactions/consolidatedMints',
            paymentRequests: 'PaymentRequest/paymentRequests',
            isBlockchainSynced: 'Blockchain/isBlockchainSynced',
            isReindexing: 'ApiStatus/isReindexing'
        }),
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
        initialize() {
            this.refreshTable();
        },
        
        refreshTable() {
            this.resetTimers();
            
            let historyData = this.TIR.readFile();
            let tableData = Object.values(historyData);

            tableData.forEach(element => {
                if (!finishedStatuses.includes(element.status)) {
                    this.statusWatcher[element.id] = element;
                }
            });

            for (let key in this.statusWatcher) {
                const transaction = this.statusWatcher[key];

                this.checkTransactionStatus(transaction);

                this.statusWatcher[key].timer = setInterval(() => {
                    this.checkTransactionStatus(transaction);
                }, 5000);
            }

            this.tableData = tableData;
        },

        resetTimers() {
            for (let key in this.statusWatcher) {
                clearInterval(this.statusWatcher[key].timer);
            }

            this.statusWatcher = {};
        },

        async checkTransactionStatus(transaction) {
            if (!transaction) return;

            const { orderId } = transaction;

            const { error, response: transactionData } = await this.api.getOrderStatus({ orderId });

            if (error) {
                console.log(`Fail to fetch transaction data.`);
                return;
            }

            let statusChanged = false;

            if (finishedStatuses.includes(transactionData.status)) {
                this.tableData = this.tableData.map(element => {
                    if (element.orderId === orderId) {
                        element.status = transactionData.status;
                    }

                    return element;
                });

                let historyData = this.TIR.readFile();

                statusChanged = transactionData.status !== historyData[orderId].status;

                historyData[orderId] = {
                    ...historyData[orderId],
                    rate: transactionData.rate,
                    receivedAmount: transactionData.rate,
                    status: transactionData.status
                };

                this.TIR.writeFile(historyData);

                if (this.statusWatcher[orderId] && this.statusWatcher[orderId].timer) {
                    clearInterval(this.statusWatcher[orderId].timer);
                }

                delete this.statusWatcher[orderId];
            } else {
                let historyData = this.TIR.readFile();

                statusChanged = transactionData.status !== historyData[orderId].status;

                historyData[orderId] = {
                    ...historyData[orderId],
                    status: transactionData.status
                };

                this.TIR.writeFile(historyData);
            }

            if (statusChanged) {
                EventBus.$emit('refresh-table');
            }
        },

        comparePayments(a, b) {
            return !['id', 'fromCoin', 'toCoin', 'sentAmount', 'receiveAmount', 'fee', 'status'].find(field => a[field] !== b[field]);
        },

        onRowSelect(data) {
            if (data?.toCoin === "FIRO" && data?.status === "waiting") {
                this.show = true;
                this.orderID = data.id;
                this.exchangeAddress = data.exchangeAddress;
                this.amount = +data.sentAmount;
                this.selectedCoin = data.fromCoin;
            }
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
