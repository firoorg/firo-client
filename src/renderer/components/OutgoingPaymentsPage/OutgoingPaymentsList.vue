<template>
    <section class="outgoing-payments-list">
        <div class="table-filter-input-wrap">
            <base-filter-input type="text"
                               class="table-filter-input"
                               v-model="urlFilter"
                               :placeholder="$t('send.table__outgoing-payments.placeholder__filter')" />
        </div>

        <animated-table :data="filteredTransactions"
                        :fields="tableFields"
                        track-by="id"
                        :sort-order="[{ field: 'firstSeenAt', direction: 'desc' }]"
                        :selected-row="selectedPayment"
                        no-data-message="No Payments made yet."
                        :on-row-select="onTableRowSelect">
            <template slot="label" slot-scope="props">
                <natural-language-tags :content="props.rowData.label"></natural-language-tags>
            </template>
        </animated-table>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'

    import FilterByUrlParamMixin from '@/mixins/FilterByUrlParamMixin'

    import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
    import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'
    import Amount from '@/components/AnimatedTable/AnimatedTableAmount'
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
            name: Amount,
            title: 'send.table__outgoing-payments.label__amount',
            sortField: 'amount',
            width: '20%'
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
                return this.getFilteredByUrl(this.transactionsWithCategoryTags, ['label', 'category'])
            }
        },

        methods: {
            onTableRowSelect (rowData, index, event) {
                console.log('rowData', rowData)
                const { id, isPrivate } = rowData

                console.log(this.$route)

                const { id: currentRouterId } = this.$route.params

                // console.log(currentRouterId, id, currentRouterId === id)
                console.log('isPrivate', isPrivate)
                // deselect
                if (currentRouterId === id) {
                    console.log('returning to send form')
                    this.$emit('selection-change', {
                        name: 'send-zcoin'
                    })
                } else {
                    this.$emit('selection-change', {
                        name: 'public-payment',
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

                if (category === 'send') {
                    return `${label} #${this.$t('send.table__outgoing-payments.label__tx-category-send')}`
                } else if (category === 'spendOut') {
                    return `${label} #${this.$t('send.table__outgoing-payments.label__tx-category-spendOut')}`
                }

                return label
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
