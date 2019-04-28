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
            walletAddresses: 'Address/walletAddresses',
            allPaymentRequests: 'PaymentRequest/allPaymentRequests',
            outgoingTransactions: 'Address/getOutgoingTransactions'
        }),

        sortOrder () {
            return [
                {
                    sortField: 'time',
                    direction: 'desc'
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
            const spendCategories = ['send', 'mint', 'spendOut', 'mined']
            const receiveCategories = ['receive', 'spendIn']
            const nullCategories = ['orphan']

            const data = []
            for (const addr of this.walletAddresses) {
                for (const tx of addr.transactions) {
                    if (nullCategories.includes(tx.category)) {
                        continue
                    }

                    let tableRow = {}
                    tableRow.address = addr.address
                    // Setting a date of Infinity causes AnimatedTableRelativeData to not render anything but still sort
                    // as if the transaction just happened.
                    tableRow.time = tx.block ? tx.block.time : Infinity
                    tableRow.txId = tx.txid
                    tableRow.isError = false
                    tableRow.confirmations = tx.confirmations
                    tableRow.isConfirmed = tx.isConfirmed
                    // This is different from txId because a single transaction (from the blockchain's perspective) can
                    // be both incoming and outgoing to us, which will require it to be displayed in the table multiple
                    // times.
                    tableRow.id = tx.id

                    if (spendCategories.includes(tx.category)) {
                        tableRow.amount = tx.amount
                    } else if (receiveCategories.includes(tx.category)) {
                        tableRow.amount = -tx.amount
                    } else {
                        this.$log.error("Displaying transaction %s with an unknown category %s", tx.id, tx.category)
                        // I guess showing the user a zero amount is better than blocking the UI with a warning or
                        // silently ignoring the transaction ... maybe
                        tableRow.amount = 0
                    }

                    if (tableRow.amount > 0) {
                        tableRow.label = this.getLabelForPaymentRequestAddress(tableRow.address)
                    } else if (tableRow.amount < 0) {
                        tableRow.label = this.getLabelForOutgoingTransaction(tableRow.id)
                    } else {
                        // As above, I couldn't really think of a better behaviour. At least we're alerting the user to
                        // the presence of the bug...
                        tableRow.label = "THIS IS A BUG: tx " + tx.id + " has unknown category " + tx.category
                        tableRow.isError = true
                    }

                    data.push(tableRow)
                }
            }

            return data
        }
    },

    methods: {
        compareTableRow (a, b) {
            return a.id === b.id
        },

        getLabelForPaymentRequestAddress (address) {
            for (const pr of this.allPaymentRequests) {
                if (pr.address === address) {
                    return pr.label || this.$t('transaction-list.placeholder__recv-no-label')
                }
            }

            return 'Incoming Transaction Not Found'
        },

        getLabelForOutgoingTransaction (txId) {
            for (const tx of this.outgoingTransactions) {
                if (tx.id === txId) {
                    return this.addCategoryTagToLabelForOutgoingTransaction(tx)
                }
            }

            return 'Outgoing Transaction Not Found'
        },

        // copypasted from OutgoingPaymentsList's addCategoryTagToLabel
        addCategoryTagToLabelForOutgoingTransaction (tx) {
            const { label: value, category } = tx
            const label = value || this.$t('send.table__outgoing-payments.label__tx-nolabel')
            let catLabel = ''

            if (category === 'send') {
                catLabel = `#${this.$t('send.table__outgoing-payments.label__tx-category-send')}`
            } else if (category === 'spendOut') {
                catLabel = `#${this.$t('send.table__outgoing-payments.label__tx-category-spendOut')}`
            }

            if (label.includes(catLabel)) {
                return label
            }

            return `${label} ${catLabel}`
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