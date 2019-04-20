<template>
    <section class="outgoing-payments-list">
        <div class="table-filter-input-wrap">
            <base-filter-input
                v-model="urlFilter"
                type="text"
                class="table-filter-input"
                :placeholder="$t('send.table__outgoing-payments.placeholder__filter')"
            />
        </div>

        <animated-table
            :data="filteredTransactions"
            :fields="tableFields"
            track-by="id"
            :selected-row="selectedPayment"
            no-data-message="No Payments made yet."
            :on-row-select="onTableRowSelect"
            :sort-order="sortOrder"
            :compare-elements="compareTransactions"
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

import FilterByUrlParamMixin from '@/mixins/FilterByUrlParamMixin'

import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'
import OutgoingAmount from '@/components/AnimatedTable/AnimatedTableOutgoingAmount'
import OutgoingPaymentTableStatus from '@/components/AnimatedTable/OutgoingPaymentTableStatus'
import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'

const tableFields = [
    {
        name: OutgoingPaymentTableStatus,
        isFulfilledKey: 'isConfirmed',
        sortField: 'isConfirmed',
        width: '2rem'
    },
    {
        name: RelativeDate,
        title: 'send.table__outgoing-payments.label__sent',
        dateField: 'firstSeenAt',
        sortField: 'firstSeenAt',
        width: '25%'
    },
    {
        name: 'label',
        title: 'send.table__outgoing-payments.label__label',
        sortField: 'label'
    },
    {
        name: OutgoingAmount,
        title: 'send.table__outgoing-payments.label__amount',
        sortField: 'amount',
        width: '20%'
    }
]

export default {
    name: 'OutgointPaymentsList',

    components: {
        AnimatedTable,
        NaturalLanguageTags
    },

    mixins: [
        FilterByUrlParamMixin
    ],

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
            transactions: 'Address/getOutgoingTransactions'
        }),

        transactionsWithCategoryTags () {
            return this.transactions.map((tx) => {
                return {
                    ...tx,
                    label: this.addCategoryTagToLabel(tx)
                }
            })
        },

        filteredTransactions () {
            return this.getFilteredByUrl(this.transactionsWithCategoryTags, ['belongsToAddress', 'label', 'category'])
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
