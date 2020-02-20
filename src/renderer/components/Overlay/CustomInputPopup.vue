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
            pagination-path="pagination"
            @vuetable:loaded="onLoadingCompleted"
            :track-by="trackBy"
            :per-page="perPage"
            @vuetable:pagination-data="onPaginationData"
            @vuetable:checkbox-toggled-custom="toggleCheckbox"
        >
            <div
                slot="status"
                slot-scope="props"
                @click="toggleSlider(props.rowData)"
                :style="{ cursor: 'pointer'}"
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

        <div>
            <animated-table-pagination
                ref="pagination"
                @vuetable-pagination:change-page="onChangePage"
            />
        </div>

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
import AnimatedTablePagination from '@/components/AnimatedTable/AnimatedTablePagination'
import { convertToSatoshi, convertToCoin } from "#/lib/convert";
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
        UnlockIcon,
        AnimatedTablePagination
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
            selectedTx: {},
            unselected: {}
        }
    },
    computed: {
        ...mapGetters({
            transactions: 'Transactions/transactions',
            selectedUtxos: 'ZcoinPayment/selectedInputs',
            enteredAmount: 'ZcoinPayment/enteredAmount',
            currentHeight: 'Blockchain/currentBlockHeight',
            unspentUTXOs: 'Transactions/unspentUTXOs'
        }),

        tableData () {
            const tableData = [];
            for (const [id, isIn] of Object.entries(this.unspentUTXOs)) {
                let tx = this.transactions[id];
                if (!tx || !tx.blockHeight) continue;
                if (this.$route.path == '/send/private') {
                    if (!['mint'].includes(tx.category)) {
                        continue;
                    }
                    if (this.currentHeight < (tx.blockHeight + 6.0) - 1.0) {
                        continue;
                    }
                } else {
                    if (!['coinbase', 'znode', 'mined', 'receive'].includes(tx.category)) {
                        continue;
                    }

                    if (['coinbase', 'mined'].includes(tx.category) &&
                        (this.currentHeight < (tx.blockHeight + 100.0) - 1.0)) {
                        continue;
                    }
                }
                let timestamp = new Date(tx.blockTime * 1000) || Infinity;
                tableData.push({
                    id: `/transaction-info/${id}`,
                    txIndex: tx.txIndex + "",
                    timestamp: timestamp,
                    amount: tx.amount,
                    status: !tx.locked,
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
            console.log('entered amount:', this.enteredAmount);
            if (this.totalSelected === 0 ) {
                return alert("Please select at least one !");
            }

            if (this.totalSelected < convertToSatoshi(this.enteredAmount)) {
                return alert("Selected amount of " + convertToCoin(this.totalSelected) + " is less than required sending amount of " + this.enteredAmount);
            }
            let agree = confirm("Are you sure?");

            if (!agree) return

            // close dialog and trigger payment event
            this.$store.dispatch('ZcoinPayment/TOGGLE_CUSTOM_INPUTS_POPUP');

            // get selected utxos
            const utxos = [];
            const statusChanges = [];
            this.tableData.forEach(element => {
                if (this.selectedTx[element.uniqId]) {
                    utxos.push(element)
                }
                if (element.status === this.transactions[element.uniqId].locked) {
                    statusChanges.push(element);
                }
            });

            this.$store.commit('ZcoinPayment/UPDATE_CUSTOM_INPUTS', utxos);
            this.$store.commit('ZcoinPayment/UPDATE_COIN_LOCK', statusChanges);
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
            const orderBy = sortOrder.length ? sortOrder : this.sortOrder
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
        toggleAllCheckbox(isChecked) {
            if (!isChecked) {
                this.totalSelected = 0;
                this.selectedTx = {};
                this.tableData.forEach(element => {
                    this.unselected[element.uniqId] = true;
                });
            } else {
                let sum = 0;
                this.tableData.forEach(element => {
                    sum += element.amount;
                    this.selectedTx[element.uniqId] = true;
                    this.unselected[element.uniqId] = false;
                });
                this.totalSelected = sum;
            }
        },
        convertToCoin: convertToCoin,
        convertToSatoshi: convertToSatoshi,
        toggleCheckbox(isCheck, dataItem) {
            if (!isCheck) {
                this.selectedTx[dataItem.uniqId] = false;
                if (dataItem.status) {
                    this.totalSelected -= dataItem.amount
                }
                this.unselected[dataItem.uniqId] = true;
            } else {
                this.selectedTx[dataItem.uniqId] = true;
                this.totalSelected += dataItem.amount
                this.unselected[dataItem.uniqId] = false;
                dataItem.status = true;
            }
        },
        onLoadingCompleted() {
            if (this.selectedUtxos) {
                this.selectedUtxos.forEach(element1 => {
                    let found = false;
                    this.tableData.forEach(element2 => {
                        if (element1.uniqId == element2.uniqId) {
                            found = true;
                        }
                    });

                    if (found) {
                        if (!this.unselected[element1.uniqId]) {
                            this.$refs.vuetable.selectId(element1.uniqId);
                            if (!this.selectedTx[element1.uniqId]) {
                                this.totalSelected += element1.amount;
                            }
                            this.selectedTx[element1.uniqId] = true;
                        }
                    }
                });
            }
        },
        toggleSlider(dataItem) {
            console.log('Slider is toggled:', dataItem);
            dataItem.status = !dataItem.status;
            // this.lockedCoinsChanges[dataItem.uniqId] = dataItem.status;
            // if (this.transactions[dataItem.uniqId].locked === (!dataItem.status)) {
            //     delete this.lockedCoinsChanges[dataItem.uniqId];
            // }
        },
        isLocked(dataItem) {
            return !dataItem.status;
        },
        closePopup() {
            if (this.totalSelected === 0 ) {
                this.$store.dispatch('ZcoinPayment/UPDATE_CUSTOM_INPUTS', []);
            } 
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
