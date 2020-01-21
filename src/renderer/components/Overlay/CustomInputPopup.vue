<template>
    <section class="custom-input-popup animated-table">
        <a
            class="close"
            @click="closePopup"
        >&times;</a>
        <h4>
            Available UTXOs
        </h4>
        <vuetable
            ref="vuetable"
            :api-mode="false"
            :fields="tableFields"
            :data-manager="dataManager"
            :track-by="trackBy"
            @vuetable:checkbox-toggled-custom="toggleCheckbox"
        >
            <div
                slot="status"
                slot-scope="props"
            >
                <span
                    v-if="props.rowData.status === true"
                    class="tx-enable"
                >
                    <unlock-icon />
                </span>
                <span
                    v-else
                    class="tx-disable"
                >
                    <lock-icon />
                </span>
            </div>

            <div
                slot="amount"
                slot-scope="props"
                class="vuetable-amount"
            >
                {{ convertToCoin(props.rowData.amount) + " XZC" }}
                <u
                    v-if="props.rowData.category === 'znode'"
                >
                    MASTERNODE COLLATERAL
                </u>
            </div>
            
            <div
                slot="timestamp"
                slot-scope="props"
                class="vuetable-timestamp"
            >
                {{ props.rowData.timestamp.toLocaleDateString() + " " + props.rowData.timestamp.toLocaleTimeString() }}
            </div>
        </vuetable>
        <div class="popup-footer">
            <h4> Total Currenly Selected: {{ convertToCoin(totalSelected) }} XZC</h4>
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
import Vue from 'vue'
import { Vuetable } from 'vuetable-2'
import _ from 'lodash'
import VueTableCheckbox from '@/components/Overlay/VueTableCheckbox'
import LockIcon from '@/components//Icons/LockIcon'
import UnlockIcon from '@/components//Icons/UnlockIcon'
import { convertToCoin } from "#/lib/convert";
Vue.component('vuetable-field-checkbox', VueTableCheckbox)

const tableFields = [
    {
        name: 'vuetable-field-checkbox',
        title: "checkbox",
        width: "10%",
        titleClass: "vuetable-checkbox-header",
    },
    {
        name: 'amount',
        title: 'Amount',
        sortField: 'amount',
        width: "15%",
        formatter: value => convertToCoin(value) + " XZC",
    },
    {
        name: 'status',
        sortField: 'status',
        width: '25%'
    },
    {
        name: 'timestamp',
        sortField: 'timestamp',
        width: "20%"
    },
    {
        name: "txIndex",
        title: 'Index',
        sortField: 'txIndex',
        width: '15%'
    }
   
];

export default {
    name: 'CustomInputPopup',
    components: {
        Vuetable,
        LockIcon,
        UnlockIcon
    },
    props: {
        trackBy: {
            type: String,
            default: 'uniqId'
        },
        sortOrder: {
            type: Array,
            default: () => [
                {
                    field: 'txIndex',
                    direction: 'desc',
                    sortField: 'txIndex'
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
            filter: '',
            totalSelected: 0,
            selectedTx: {}
        }
    },
    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions'
        }),

        tableData () {
            const tableData = [];
            console.log('transaction:', this.transactions);
            for (const [id, tx] of Object.entries(this.transactions)) {
                if (!['mined', 'receive', 'znode'].includes(tx.category)) {
                    continue;
                }
                let timestamp = new Date(tx.blockTime * 1000) || Infinity;
                tableData.push({
                    id: `/transaction-info/${id}`,
                    txIndex: tx.txIndex + "",
                    timestamp: timestamp,
                    amount: tx.amount,
                    status: tx.category !== 'znode',
                    txid: tx.txid,
                    uniqId: tx.uniqId,
                    category: tx.category,
                    address: tx.address
                });
            }
            return tableData;
        },

        filteredTableData () {
            return this.tableData;
        }
    },
    watch:{
        $route (to, from){
            this.$store.dispatch('ZcoinPayment/TOGGLE_CUSTOM_INPUTS_POPUP');
        }
    },
    methods: {
        comparePayments(a, b) {
            return !['blockHeight', 'timestamp', 'amount', 'txId'].find(field =>
                a[field] !== b[field]
            );
        },
        confirmSelect() {
            if (this.totalSelected === 0 ) {
                return alert("Please select at least one !")
            }
            let agree = confirm("Are you sure?");

            if (!agree) return

            // close dialog and trigger payment event
            this.$store.dispatch('ZcoinPayment/TOGGLE_CUSTOM_INPUTS_POPUP');

            // get selected utxos
            const utxos = [];
            this.tableData.forEach(element => {
                if (this.selectedTx[element.uniqId]) {
                    utxos.push(element)
                }
            });

            this.$store.dispatch('ZcoinPayment/UPDATE_CUSTOM_INPUTS', utxos);
        },
        getRowClass (item, index) {
            const classes = []

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

        dataManager (sortOrder, pagination) {
            if (this.tableData.length < 1) {
                return {
                    data: []
                }
            }

            let local = this.tableData
            const orderBy = sortOrder.length ? sortOrder : this.sortOrder
            if (orderBy.length > 0) {
                local = _.orderBy(
                    local,
                    orderBy[0].sortField,
                    orderBy[0].direction
                )
            }

            return {
                data: local
            }
        },
        toggleAllCheckbox(isChecked) {
            if (!isChecked) {
                this.totalSelected = 0;
                this.selectedTx = {};
            } else {
                let sum = 0;
                this.tableData.forEach(element => {
                    sum += element.amount;
                    this.selectedTx[element.uniqId] = true;
                });
                this.totalSelected = sum;
            }
        },
        convertToCoin: convertToCoin,
        toggleCheckbox(isCheck, dataItem) {
            if (!isCheck) {
                this.selectedTx[dataItem.uniqId] = false;
                this.totalSelected -= dataItem.amount
            } else {
                this.selectedTx[dataItem.uniqId] = true;
                this.totalSelected += dataItem.amount
            }
        },
        closePopup() {
            this.$store.dispatch('ZcoinPayment/TOGGLE_CUSTOM_INPUTS_POPUP');
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
        overflow: auto;
        .close{
            position: absolute;
            top: 15px;
            right: 30px;
            transition: all 200ms;
            font-size: 30px;
            font-weight: bold;
            text-decoration: none;
            color: #333;
            cursor: pointer;
        }
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
        .vuetable-timestamp{
            font-size: 11px;
        }
        .vuetable-amount > u{
            display: block;
            font-size: 8px;
            font-style: italic;
        }
        .tx-enable{
            // background: green;
            width: 78%;
            height: 5px;
            background: #58ca58;
            display: inline-block;
            >img {
                float: right;
                margin-top: -8px;
                margin-right: -13px;
                width: 15px;
                filter: invert(74%) sepia(13%) saturate(1998%) hue-rotate(85deg) brightness(93%) contrast(85%);
            }
        }
        .tx-disable{
            width: 78%;
            height: 5px;
            background: #ef3650;
            display: inline-block;
            margin-left: 12px;
            >svg {
                float: left;
                margin-top: -8px;
                margin-left: -13px;
            }
        }
    }
</style>
