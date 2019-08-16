<template>
    <section class="payments-list">
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
            :selected-row="selectedPayment"
            no-data-message="No Payments made yet."
            :on-row-select="onTableRowSelect"
            :sort-order="sortOrder"
            :compare-elements="comparePayments"
            :per-page="13"
        />
    </section>
</template>

<script>
import { mapGetters } from 'vuex';

import AnimatedTable from '@/components/AnimatedTable/AnimatedTable';
import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate';
import Amount from '@/components/AnimatedTable/AnimatedTableAmount';
import PaymentStatus from '@/components/AnimatedTable/AnimatedTablePaymentStatus';
import Label from '@/components/AnimatedTable/AnimatedTableLabel';

import { convertToCoin } from "#/lib/convert";

const tableFields = [
    {
        name: PaymentStatus,
        width: '2em'
    },
    {
        name: RelativeDate,
        title: 'send.table__outgoing-payments.label__sent',
        dateField: 'data',
        sortField: 'date',
        width: '25%'
    },
    {
        name: Label,
        title: 'send.table__outgoing-payments.label__label',
        sortField: 'label'
    },
    {
        name: Amount,
        title: 'send.table__outgoing-payments.label__amount',
        sortField: 'amount',
        width: '20%'
    }
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
            filter: ''
        }
    },

    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            addresses: 'Transactions/addresses',
            consolidatedMints: 'Transactions/consolidatedMints',
            paymentRequests: 'PaymentRequest/paymentRequests',
            spendLabelBugWorkaroundCache: 'Transactions/spendLabelBugWorkaroundCache'
        }),

        tableData () {
            const tableData = [];

            if (this.spendLabelBugWorkaroundCache[1] === 'unreachable') {
                throw 'unreachable';
            }

            for (const [id, tx] of Object.entries(this.transactions)) {
                // Mints are handled separately.
                if (tx.category === 'mint') {
                    continue;
                }

                if (!['mined', 'receive', 'spendIn', 'send', 'spendOut', 'znode'].includes(tx.category)) {
                    this.$log.error(`unknown category '${tx.category}' on tx ${id}`);
                    continue;
                }

                if (!tx.address) {
                    this.$log.error(`transaction ${id} with no associated address`);
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
                    category: tx.category,
                    blockHeight: tx.blockHeight,
                    date: tx.blockTime * 1000 || Infinity,
                    amount: tx.amount,
                    address: tx.address,
                    label: tx.label || (tx.category === 'spendOut' ? this.spendLabelBugWorkaroundCache[tx.txid] : undefined),
                    extraSearchText: extraSearchText + (['send', 'spendOut'].includes(tx.category) ? '-' : '+') + convertToCoin(tx.amount)
                });
            }

            for (const [blockHeight, mintInfo] of Object.entries(this.consolidatedMints)) {
                tableData.push({
                    id: `/mint-info/${blockHeight}`,
                    category: 'mint',
                    blockHeight: blockHeight,
                    date: mintInfo.blockTime * 1000 || Infinity,
                    amount: mintInfo.totalMintAmount,
                    label: null,
                    // Coordinate this with the default values in AnimatedTableLabel.
                    extraSearchText: 'Private Mint (' + convertToCoin(mintInfo.totalMintAmount) + ')'
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
                    category: 'payment-request',
                    blockHeight: null,
                    date: pr.createdAt,
                    amount: pr.amount,
                    label: pr.label,
                    // Coordinate this with the default values in AnimatedTableLabel.
                    extraSearchText: 'Payment Request (' + convertToCoin(pr.amount) + ')'
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
            return !!['id', 'category', 'blockHeight', 'date', 'amount', 'address', 'label'].find(field =>
                a[field] !== b[field]
            );
        },

        async onTableRowSelect (rowData) {
            // id is always set to the path of the detail route of the payment.
            if (this.$route.path !== rowData.id) {
                this.$router.push(rowData.id);
            }
        }
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
