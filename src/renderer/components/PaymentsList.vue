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
            :compare-elements="compareTransactions"
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
            paymentRequests: 'PaymentRequest/paymentRequests'
        }),

        tableData () {
            const tableData = [];

            for (const [id, tx] of Object.entries(this.transactions)) {
                let paymentType;
                let defaultLabel;
                switch (tx.category) {
                case 'mined':
                    defaultLabel = '#Mining Reward';
                    paymentType = 'incoming';
                    break;

                case 'receive':
                    paymentType = 'incoming';
                    defaultLabel = 'Incoming Transaction';
                    break;

                case 'send':
                    paymentType = 'outgoing';
                    defaultLabel = 'Outgoing Transaction';
                    break;

                default:
                    this.$log.error(`unknown payment type on tx ${id}`);
                    continue;
                }

                if (!tx.address) {
                    console.log(tx);
                }

                tableData.push({
                    // id is the path of the detail route for the transaction.
                    id: `/transaction/${id}`,
                    paymentType: paymentType,
                    blockHeight: tx.blockHeight,
                    date: tx.blockTime * 1000 || Infinity,
                    amount: tx.amount,
                    address: tx.address,
                    label: tx.label || defaultLabel
                });
            }

            for (const pr of this.paymentRequests) {
                // There are actual transactions associated with the request now, so we don't need to show it.
                if (pr.amountReceived) {
                    continue;
                }

                tableData.push({
                    // id is the path of the detail route for the payment request.
                    id: `/payment-request/${pr.address}`,
                    paymentType: 'payment-request',
                    blockHeight: null,
                    // Outstanding payment requests will always be sorted first.
                    date: Infinity,
                    amount: pr.amountRequested,
                    label: pr.label
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
                ['label', 'address'].find(key =>
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
        compareTransactions (a, b) {
            return a.id === b.id
        },

        onTableRowSelect (rowData) {
            return;

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
