<template>
    <section class="payments-page">
        <div class="inner">
            <div class="top-section">
                <input
                    v-model="filter"
                    type="text"
                    class="table-filter-input"
                    :placeholder="$t('send.table__outgoing-payments.placeholder__filter')"
                />

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
                :per-page="17"
                :on-page-change="(pageNumber) => this.currentPage = pageNumber"
            />
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex';

import AnimatedTable from 'renderer/components/AnimatedTable/AnimatedTable';
import RelativeDate from 'renderer/components/AnimatedTable/AnimatedTableRelativeDate';
import Amount from 'renderer/components/AnimatedTable/AnimatedTableAmount';
import Label from 'renderer/components/AnimatedTable/AnimatedTableLabel';

import { convertToCoin } from "lib/convert";

const tableFields = [
    {name: RelativeDate},
    {name: Label},
    {name: Amount}
];

export default {
    name: 'PaymentsList',

    components: {
        AnimatedTable,
    },

    props: {
        selectedPayment: {
            type: String,
            default: null
        }
    },

    data () {
        return {
            tableFields,
            filter: '',
            tableData: [],
            newTableData: [],
            currentPage: 1
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

        newTableData() {
            this.$emit('resize');
        },

        showUnsyncedWarning() {
            this.$emit('resize');
        }
    },

    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            addresses: 'Transactions/addresses',
            paymentRequests: 'PaymentRequest/paymentRequests',
            isBlockchainSynced: 'Blockchain/isBlockchainSynced',
            isReindexing: 'ApiStatus/isReindexing'
        }),

        showUnsyncedWarning() {
            return !this.isBlockchainSynced || this.isReindexing;
        },

        latestTableData () {
            const tableData = [];

            for (const [id, tx] of Object.entries(this.transactions)) {
                // Mined transactions are incorrectly marked as change.
                if (tx.isChange && tx.category !== 'mined') {
                    continue;
                }
                // Mints are handled separately.
                if (tx.category === 'mint') {
                    continue;
                }

                if (!['mined', 'receive', 'spendIn', 'send', 'spendOut', 'znode'].includes(tx.category)) {
                    this.$log.error(`unknown category '${tx.category}' on tx ${id}`);
                    continue;
                }

                // Coordinate this with the default values in AnimatedTableLabel.
                let extraSearchText;
                switch (tx.category) {
                case 'mined':
                    extraSearchText = 'Mined Transaction';
                    break;

                case 'receive':
                case 'spendIn':
                    extraSearchText = 'Incoming Transaction';
                    break;

                case 'send':
                case 'spendOut':
                    extraSearchText = 'Outgoing Transaction';
                    break;

                case 'znode':
                    extraSearchText = 'Znode Payment';
                    break
                }

                tableData.push({
                    // id is the path of the detail route for the transaction.
                    id: `/transaction-info/${id}`,
                    txid: tx.txid,
                    category: tx.category,
                    blockHeight: tx.blockHeight,
                    date: tx.blockTime * 1000 || Infinity,
                    amount: tx.amount,
                    address: tx.address,
                    label:
                        tx.label ||
                        (this.paymentRequests[tx.address] ? this.paymentRequests[tx.address].label : undefined),
                    extraSearchText: extraSearchText + (['send', 'spendOut'].includes(tx.category) ? '-' : '+') + convertToCoin(tx.amount)
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
                ['label', 'address', 'category', 'extraSearchText'].find(key =>
                    tableRow[key] && tableRow[key].toLowerCase().indexOf(filter) !== -1
                )
            )
        },

        sortOrder () {
            return [
                {
                    sortField: 'date',
                    direction: 'desc'
                }
            ]
        }
    },

    methods: {
        comparePayments(a, b) {
            return !['id', 'category', 'blockHeight', 'date', 'amount', 'address', 'label'].find(field =>
                a[field] !== b[field]
            );
        },

        reloadTable() {
            this.tableData = this.newTableData;
            this.newTableData = [];
        }
    }
}
</script>

<style lang="scss" scoped>
@import "src/renderer/styles/inputs";
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/colors";

.payments-page {
    height: 100%;

    .inner {
        box-sizing: border-box;
        height: 100%;
        padding: $size-main-margin;

        display: flex;
        flex-flow: column;

        .top-section {
            height: fit-content;

            .table-filter-input {
                margin: {
                    left: auto;
                    right: 0;
                    bottom: $size-medium-space;
                }

                @include search-input();
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
