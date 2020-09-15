<template>
    <section class="tx-list">
        <div class="table-filter-input-wrap">
            <input
                v-model="filter"
                type="text"
                class="table-filter-input"
                :placeholder="$t('send.table__outgoing-payments.placeholder__filter')"
            />
        </div>

        <animated-table
            :data="filteredTableData"
            :fields="tableFields"
            track-by="id"
            no-data-message="No Transactions made yet."
            :sort-order="sortOrder"
            :compare-elements="compareTransactions"
            :per-page="13"
            :on-page-change="(pageNumber) => this.currentPage = pageNumber"
        />
    </section>
</template>

<script>
import { mapGetters } from 'vuex';

import AnimatedTable from '@/components/AnimatedTable/AnimatedTable';
import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate';
import Amount from '@/components/AnimatedTable/AnimatedTableAmount';
import Label from '@/components/AnimatedTable/AnimatedTableLabel';

import { convertToCoin } from "#/lib/convert";

const tableFields = [
    {
        name: RelativeDate,
        title: 'Date',
        dateField: 'date',
        sortField: 'date',
        width: '25%'
    },
    {
        name: "type",
        title: 'Type',
        sortField: 'type',
        width: '25%'
    },
    {
        name: "label",
        title: 'send.table__outgoing-payments.label__label',
        sortField: 'label',
        width: '25%'
    },
    {
        name: Amount,
        title: 'send.table__outgoing-payments.label__amount',
        sortField: 'amount',
        width: '25%'
    }
];

export default {
    name: 'TransactionList',

    components: {
        AnimatedTable,
        RelativeDate,
        Amount,
        Label
    },

    props: {
        
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
        currentPage(newPage, oldPage) {
            console.log(`currentPage: ${oldPage} -> ${newPage}`);
        },

        latestTableData: {
            immediate: true,

            handler() {
                this.newTableData = this.latestTableData;
                console.log("Read table")
                if (this.currentPage === 1) {
                    this.reloadTable();
                }
            }
        }
    },

    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            addressBook: "Transactions/addressBook",
            paymentRequests: 'PaymentRequest/paymentRequests',
            consolidatedMints: 'Transactions/consolidatedMints',
            paymentChannels:'Transactions/paymentChannels'
        }),

        latestTableData () {
            const tableData = [];

            for (const [id, tx] of Object.entries(this.transactions)) {
                // Mined transactions are incorrectly marked as change.
                if (tx.isChange && tx.category !== 'mined') {
                    continue;
                }
                if (tx.amount <= 0) {
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
                
                var txType = "Regular address";
                var label = tx.label;

                if (!tx.address) {
                    this.$log.error(`transaction ${id} with no associated address`);
                    continue;
                }

                // Coordinate this with the default values in AnimatedTableLabel.
                let extraSearchText;
                let extraSearchTextLabeling;
                switch (tx.category) {
                case 'mined':
                    extraSearchText = 'Mined Transaction';
                    extraSearchTextLabeling = extraSearchText;
                    break;

                case 'receive':
                case 'spendIn':
                    extraSearchText = 'Incoming Transaction';
                    extraSearchTextLabeling = extraSearchText;
                    if (tx.paymentChannelID) {
                        txType = "RAP address";
                        let receivePcode = tx.paymentChannelID.split("-")[0];
                        if (this.paymentChannels[receivePcode]) {
                            label = this.paymentChannels[receivePcode][0].label;
                            extraSearchText = extraSearchText + ' ' + label; 
                        }
                        extraSearchText += ' ' + tx.paymentChannelID + receivePcode;
                    }
                    break;

                case 'send':
                case 'spendOut':
                    extraSearchText = 'Outgoing Transaction';
                    extraSearchTextLabeling = extraSearchText;
                    if (tx.paymentChannelID) {
                        txType = "RAP address";
                        let receivePcode = tx.paymentChannelID.split("-")[0];
                        if (this.paymentChannels[receivePcode]) {
                            label = this.paymentChannels[receivePcode][0].label;
                            extraSearchText = extraSearchText + ' ' + label; 
                        }
                        extraSearchText += ' ' + tx.paymentChannelID + receivePcode;
                    }
                    break;

                case 'znode':
                    extraSearchText = 'Znode Payment';
                    extraSearchTextLabeling = extraSearchText;
                    break
                }

                if (tx.isNotificationTransaction) {
                    txType = "Connection Fee";
                    if (this.paymentChannels[tx.paymentCode]) {
                        label = this.paymentChannels[tx.paymentCode][0].label;
                        extraSearchText = extraSearchText + ' ' + label; 
                    }
                    extraSearchText += ' ' + tx.paymentCode + tx.myPaymentCode;
                    if (label == "") {
                        label = "(unlabelled)";
                    }
                }
                tableData.push({
                    // id is the path of the detail route for the transaction.
                    id: `/transaction-info/${id}`,
                    txid: tx.txid,
                    type: txType,
                    category: tx.category,
                    blockHeight: tx.blockHeight,
                    date: tx.blockTime * 1000 || Infinity,
                    amount: tx.amount,
                    address: tx.address,
                    label: (!label || label == "")? extraSearchTextLabeling:label,
                    extraSearchText: extraSearchText + ' ' + tx.label + ' ' + tx.address + convertToCoin(tx.amount) + ' XZC'
                });
            }

            for (const [blockHeight, mintInfo] of Object.entries(this.consolidatedMints)) {
                tableData.push({
                    id: `/mint-info/${blockHeight}`,
                    type: 'Mint Transaction',
                    category: 'mint',
                    blockHeight: blockHeight,
                    date: mintInfo.blockTime * 1000 || Infinity,
                    amount: mintInfo.totalMintAmount,
                    label: null,
                    // Coordinate this with the default values in AnimatedTableLabel.
                    extraSearchText: 'Private Mint (' + convertToCoin(mintInfo.totalMintAmount) + ')' + ' XZC'
                });
            }

            for (const pr of Object.values(this.paymentRequests)) {
                if (this.addresses[pr.address] && this.addresses[pr.address].length) {
                    // There are actual transactions associated with the request now, so we don't need to show it.
                    continue;
                }

                if (pr.state !== 'active') {
                    // Don't show deleted or archived payment requests.
                    continue;
                }

                tableData.push({
                    // id is the path of the detail route for the payment request.
                    id: `/payment-request/${pr.address}`,
                    type: 'payment-request',
                    category: 'payment-request',
                    blockHeight: null,
                    date: pr.createdAt,
                    amount: pr.amount,
                    label: pr.label,
                    // Coordinate this with the default values in AnimatedTableLabel.
                    extraSearchText: 'Payment Request (' + convertToCoin(pr.amount) + ')' + ' XZC' + ' ' + pr.label + ' ' + pr.address
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
                ['label', 'type', 'extraSearchText'].find(key =>
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
        compareTransactions(a, b) {
            return !['date', 'amount', 'label'].find(field =>
                a[field] !== b[field]
            );
        },

        reloadTable() {
            this.tableData = this.newTableData;
            this.newTableData = [];
        },
    }
}
</script>

<style lang="scss" scoped>
.table-filter-input-wrap {
    text-align: right;
    margin-top: emRhythm(3) * -1;
    margin-bottom: emRhythm(5);

    .table-filter-input {
        width: 45%;
    }
}


.filter-input {
    position: relative;
    display: inline-block;
}

input {
    border: none;
    width: 100%;
    box-sizing: border-box;

    @include lato-font('normal');
    @include setType(5);
    @include rhythmBorderBottom(1px, 0);

    padding: 0 emRhythm($input-bleed);
    background: $color--white-light;
    border-bottom-style: solid;
    border-bottom-color: $color--polo-medium;
    outline: none;
    transition: background 0.15s ease-out, border-color 0.15s ease-out;
    color: $color--comet-dark;

    &::placeholder {
        color: $color--comet;
        font-style: italic;
    }

    &:hover,
    &:focus {
        background-color: $color--white;
        border-bottom-color: $color--polo;
    }
}
</style>
