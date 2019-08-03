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
            :data="tableData"
            :fields="tableFields"
            track-by="id"
            :selected-row="selectedPayment"
            no-data-message="No Payments made yet."
            :on-row-select="onTableRowSelect"
            :sort-order="sortOrder"
            :compare-elements="compareTransactions"
            :per-page="12"
        >
            <template
                slot="label"
                slot-scope="props"
            >
                <natural-language-tags :content="props.rowData.label" />
            </template>
        </animated-table>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'

import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'
import Amount from '@/components/AnimatedTable/AnimatedTableAmount'
import PaymentStatus from '@/components/AnimatedTable/AnimatedTablePaymentStatus'
import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'

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
        name: 'label',
        title: 'send.table__outgoing-payments.label__label',
        sortField: 'label'
    },
    {
        name: Amount,
        title: 'send.table__outgoing-payments.label__amount',
        sortField: 'amount',
        width: '20%'
    }
]

export default {
    name: 'PaymentsList',

    components: {
        AnimatedTable,
        NaturalLanguageTags
    },

    props: {
        selectedPayment: {
            type: String,
            default: null
        }
    },

    data () {
        return {
            tableFields
        }
    },

    computed: {
        ...mapGetters({
            outgoingTransactions: 'Address/getOutgoingTransactions'
        }),

        tableData () {
            const tableData = [];

            for (const tx of this.outgoingTransactions) {
                tableData.push({
                    paymentType: 'outgoing',
                    blockHeight: tx.block && tx.block.height,
                    date: tx.block ? tx.block.time : Infinity,
                    amount: tx.amount,
                    address: tx.address,
                    label: tx.label
                });
            }

            return tableData;
        },

        sortOrder () {
            return [
                {
                    sortField: 'firstSeenAt',
                    direction: 'desc'
                }
            ]
        }
    },

    methods: {
        compareTransactions (a, b) {
            return a.id === b.id
        },

        onTableRowSelect (rowData, index, event) {
            const { id, isPrivate } = rowData

            const { id: currentRouterId } = this.$route.params

            // already selected. removing selection
            if (currentRouterId === id) {
                this.$emit('selection-change', {
                    name: 'send-zcoin'
                })
            } else {
                this.$emit('selection-change', {
                    name: `${isPrivate ? 'private' : 'public'}-payment`,
                    id
                })
            }
            /*
                this.$router.push({
                    name: 'outgoing-payment',
                    params: {
                        id
                    }
                })
                */
        },
        /*
            onTableRowSelect (rowData, index, event) {
                // todo get paymentRequest from store
                this.selectedPaymentRequest = rowData.address

                /*
                this.$router.push({
                    name: 'send-zcoin-paymentrequest',
                    params: {
                        address: this.selectedPaymentRequest
                    }
                })
                * /
            },
            */

        // copypasted to TransactionListPage.vue (as addCategoryTagToLabelForOutgoingTransaction)
        addCategoryTagToLabel (rowData) {
            const { label: value, category } = rowData
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
    .table-filter-input-wrap {
        text-align: right;
        margin-top: emRhythm(3) * -1;
        margin-bottom: emRhythm(5);

        .table-filter-input {
            width: 45%;
        }
    }
</style>
