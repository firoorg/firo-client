<template>
    <section class="custom-input-popup animated-table">
        <h4>
            Available UTXOs
        </h4>
        <vuetable
            ref="vuetable"
            :api-mode="false"
            :fields="tableFields"
            :data-manager="dataManager"
            :row-class="getRowClass"
            v-bind="{ scopedSlots: $scopedSlots }"
            @vuetable:row-clicked="onRowClick"
        >
        </vuetable>
        <div class="popup-footer">
            <h4> Total Currenly Selected: </h4>
            <base-button
                color="white"
                @click="confirmSelect()"
            >
                Confirm
            </base-button>
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex';

// import AnimatedTable from '@/components/AnimatedTable/AnimatedTable';
import { Vuetable } from 'vuetable-2'
import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate';
import Amount from '@/components/AnimatedTable/AnimatedTableAmount';
import PaymentStatus from '@/components/AnimatedTable/AnimatedTablePaymentStatus';
import Label from '@/components/AnimatedTable/AnimatedTableLabel';
import _ from 'lodash'
import { convertToCoin } from "#/lib/convert";
import VuetableFieldCheckbox from 'vuetable-2/src/components/VuetableFieldCheckbox.vue'

const tableFields = [
    {
        name: 'vuetable-field-checkbox',
        title: "checkbox",
        width: "5%"
    },
    {
        name: 'index',
        title: ''
    },
    {
        name: 'amount',
        title: 'Amount'
    },
    {
        name: 'status',
        sortField: 'status',
        dataClass: 'center aligned',
    },
    {
        name: 'timestamp',
        sortField: 'timestamp'
    },
    {
        name: "txIndex",
        title: 'Index',
        sortField: 'txIndex',
        width: '25%'
    }
   
];

export default {
    name: 'CustomInputPopup',
    components: {
        Vuetable,
        VuetableFieldCheckbox
    },
    props: {
        trackBy: {
            type: String,
            default: 'id'
        },
        sortOrder: {
            type: Array,
            default: () => [
                {
                    field: 'createdAt',
                    direction: 'desc'
                }
            ]
        },
        perPage: {
            type: Number,
            default: 10
        },
        noDataMessage: {
            type: String,
            default: 'No usable Transaction Ouput'
        },
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
            paymentRequests: 'PaymentRequest/paymentRequests'
        }),

        tableData () {
            const tableData = [];

            for (const [id, tx] of Object.entries(this.transactions)) {
                tableData.push({
                    id: `/transaction-info/${id}`,
                    txIndex: tx.txIndex + "",
                    timestamp: new Date(tx.blockTime * 1000).toLocaleDateString("en-US") || Infinity,
                    amount: tx.amount + " XZC",
                    status: true
                });
            }
            return tableData;
        },

        filteredTableData () {
            return this.tableData;
        },

    },
    methods: {
        comparePayments(a, b) {
            return !['blockHeight', 'timestamp', 'amount', 'txId'].find(field =>
                a[field] !== b[field]
            );
        },
        confirmSelect() {
            console.log("confirm select")
        },
        getRowClass (item, index) {
            const classes = []

            if (item[this.trackBy] === this.selectedRow) {
                classes.push('selected')
            }

            if (item.isFulfilled) {
                classes.push('is-fulfilled')
            }
            if (item.isIncoming) {
                classes.push('is-incoming')
            }
            if (item.isReused) {
                classes.push('is-reused')
            }

            return classes.join(' ')
        },

        onRowClick (rowData) {
            const { data, index, event } = rowData

            if (this.onRowSelect) {
                this.onRowSelect(data, index, event)
            }
        },

        onPaginationData (paginationData) {
            this.$refs.pagination.setPaginationData(paginationData)
        },

        onChangePage (page) {
            this.rowTransition = ''
            this.$refs.vuetable.changePage(page)
            this.rowTransition = 'fade'
        },

        dataManager (sortOrder, pagination) {
            if (this.tableData.length < 1) {
                return {
                    data: []
                }
            }

            let local = this.tableData

            // see if we got a sort order passed in into the call if not,
            // fall back to the optional prop
            const orderBy = sortOrder.length ? sortOrder : this.sortOrder

            // sortOrder can still be empty, so we have to check for that as well
            if (orderBy.length > 0) {
                local = _.orderBy(
                    local,
                    orderBy[0].sortField,
                    orderBy[0].direction
                )
            }

            pagination = this.$refs.vuetable.makePagination(
                local.length,
                this.perPage
            )
            let from = pagination.from - 1
            let to = from + this.perPage

            return {
                pagination: pagination,
                data: _.slice(local, from, to)
            }
        },
        onActionClicked (action, data) {
            this.$log.debug('slot actions: on-click', data.name)
        }
    }
}
</script>

<style lang="scss" scoped>
    .custom-input-popup {
        position: absolute;
        top: 30px;
        bottom: 30px;
        left: 20px;
        right: 20px;
        padding: 20px;
        background: #fff;
        .popup-footer {
            margin-top: 10px;
            h4 {
                display: inline-block;
            }
            >button {
                float: right;
                width: 40%;
                margin-top:10px
            }
        }
    }
</style>
