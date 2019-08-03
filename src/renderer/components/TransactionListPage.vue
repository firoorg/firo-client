<template>
    <section class="transaction-list-page">
        <section
            class="transaction-list"
        >
            <h1>Transactions</h1>

            <div class="table-filter-input-wrap">
                <base-filter-input
                    v-model="filterInput"
                    type="text"
                    class="table-filter-input"
                    :placeholder="$t('transaction-list.placeholder__filter')"
                />
            </div>

            <animated-table
                :data="filteredTableData"
                :fields="tableFields"
                :no-data-message="'No data yet'"
                :sort-order="sortOrder"
                :compare-elements="compareTableRow"
                :per-page="10"
            />
        </section>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'

import TransactionStatus from '@/components/AnimatedTable/AnimatedTableTransactionStatus'
import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'
import LabelWithHashTags from '@/components/AnimatedTable/AnimatedTableLabelWithHashTags'
import ReceivedOrSentAmount from '@/components/AnimatedTable/AnimatedTableReceivedOrSentAmount'
import Address from '@/components/AnimatedTable/AnimatedTableAddress'

export default {
    name: 'MasterTransactionListPage',

    components: {
        AnimatedTable
    },

    data () {
        return {
            filterInput: '',

            tableFields: [
                {
                    name: TransactionStatus,
                    width: '5%'
                },
                {
                    // This is the amount that's going to be displayed in the table to the user. It'll be `amount` for incoming txs
                    // and `-amount` for outgoing ones.
                    name: ReceivedOrSentAmount,
                    title: 'receive.overview.table__payment-requests.label__amount',
                    sortField: 'amount',
                    contentField: 'amount',
                    width: '10%'
                },
                {
                    name: RelativeDate,
                    title: 'transaction-list.label__date',
                    dateField: 'time',
                    sortField: 'time',
                    width: '15%'
                },
                {
                    name: LabelWithHashTags,
                    title: 'transaction-list.label__label',
                    sortField: 'label',
                    contentField: 'label',
                    width: '40%'
                },
                {
                    name: Address,
                    title: 'transaction-list.label__address',
                    sortField: 'address',
                    contentField: 'address',
                    width: '30%'
                }
            ]
        }
    },

    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            currentBlockHeight: 'Blockchain/currentBlockHeight'
        }),

        sortOrder () {
            return [
                {
                    sortField: 'confirmations',
                    direction: 'ascending'
                }
            ]
        },

        filteredTableData () {
            const fields = ['address', 'label', 'txId']
            const filter = this.filterInput.toLowerCase()

            // Using FilterByUrlParamMixin is more code than rewriting it *and* this comment.
            return this.allTableData.filter( (row) =>
                fields.find( (f) =>
                    row[f].toLowerCase().search(filter) !== -1
                )
            )
        },

        allTableData () {
            const currentBlockHeight = this.currentBlockHeight;

            return this.transactions.map( (tx) => ({
                address: tx.address || 'Zerocoin_Mint',
                amount: tx.amount,
                direction: tx.paymentType,
                time: tx.block && tx.block.time,
                txId: tx.txId,
                id: tx.id,
                label: tx.label,
                // mint transactions are considered confirmed after 6 confirmations; other transactions require only 1
                isConfirmed: tx.block && (!(tx.paymentType === 'mint') || currentBlockHeight > tx.block.height + 5),
                isError: false,
                confirmations: tx.block ? currentBlockHeight - tx.block.height + 1 : 0
            }) );
        }
    },

    methods: {
        compareTableRow (a, b) {
            return (a.id === b.id) && (a.confirmations === b.confirmations)
        }
    }
}
</script>


<style lang="scss" scoped>
    .transaction-list-page {
        display: grid;
        box-sizing: border-box;

        &.tx-is-selected {
            grid-template-columns: 1fr $detail-view--min-width;
        }

        .scrollable {
            position: relative;
            z-index: 1;
            box-sizing: border-box;
            overflow: scroll;
            height: 100vh;
        }
    }

    .table-filter-input-wrap {
        text-align: right;
        margin-top: emRhythm(3) * -1;
        margin-bottom: emRhythm(5);

        .table-filter-input {
            width: 45%;
        }
    }

    .transaction-list {
        position: relative;
        padding: emRhythm(5) emRhythm(4);
        box-sizing: border-box;
        height: 100%;
    }

    .tx-detail {
        position: relative;
    }

    .create-wrap {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        width: 100%;

        .create-payment-request {
            width: 100%;
        }
    }
</style>