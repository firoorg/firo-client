<template>
    <section class="outgoing-payments-list">
        <div class="table-filter-input-wrap">
            <base-filter-input type="text"
                               class="table-filter-input"
                               v-model="urlFilter"
                               :placeholder="$t('todo.placeholder__filter')" />
        </div>

        <animated-table :data="filteredTransations"
                        :fields="tableFields"
                        track-by="id"
                        :sort-order="[{ field: 'firstSeenAt', direction: 'desc' }]"
                        _selected-row="selectedPaymentRequest"
                        _on-row-select="onTableRowSelect">
            <template slot="label" slot-scope="props">
                <natural-language-tags :content="addCategoryTagToLabel(props.rowData)"></natural-language-tags>
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
    import PaymentRequestTableStatus from '@/components/AnimatedTable/PaymentRequestTableStatus'
    import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'

    const tableFields = [
        {
            name: PaymentRequestTableStatus,
            isFulfilledKey: 'isConfirmed',
            sortField: 'isConfirmed',
            width: '2rem'
        },
        {
            name: Amount,
            title: 'todo.label__amount',
            sortField: 'amount',
            width: '25%'
        },
        {
            name: RelativeDate,
            title: 'Sent',
            dateField: 'firstSeenAt',
            sortField: 'firstSeenAt',
            width: '30%'
        },
        {
            name: 'label',
            title: 'Label',
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

        data () {
            return {
                tableFields
            }
        },

        computed: {
            ...mapGetters({
                transactions: 'Address/getOutgoingTransactions'
            }),

            filteredTransations () {
                return this.getFilteredByUrl(this.transactions, ['label', 'category'])
            }
        },

        methods: {
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
                const label = value || this.$t('todo__.noLabel')

                if (category === 'send') {
                    return `${label} #${this.$t('todo__.public')}`
                } else if (category === 'spendOut') {
                    return `${label} #${this.$t('todo__.private')}`
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
