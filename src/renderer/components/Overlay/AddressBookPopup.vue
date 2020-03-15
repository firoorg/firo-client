<template>
    <section class="address-book-popup animated-table">
        <a
            class="close"
            @click="closePopup"
        >&times;</a>
        <h4>
            Address Book
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
        >
            <div
                slot="label"
                slot-scope="props"
                class="vuetable-label"
            >
                {{ props.rowData.label }}
            </div>

            <div
                slot="address"
                slot-scope="props"
                class="vuetable-address"
            >
                {{ props.rowData.address }}
            </div>

            <div
                slot="copy"
                slot-scope="props"
                @click="copyAddress(props.rowData)"
                :style="{ cursor: 'pointer'}"
            >
                <copy-address-icon />
            </div>

            <div
                slot="edit"
                slot-scope="props"
                @click="editAddress(props.rowData)"
                :style="{ cursor: 'pointer'}"
            >
                <edit-address-icon />
            </div>

            <div
                slot="delete"
                slot-scope="props"
                @click="deleteAddress(props.rowData)"
                :style="{ cursor: 'pointer'}"
            >
                <delete-address-icon />
            </div>
        </vuetable>

        <div>
            <animated-table-pagination
                ref="pagination"
                @vuetable-pagination:change-page="onChangePage"
            />
        </div>

        <div class="popup-footer">
            <base-button
                color="white"
                @click="addNewAddress()"
            >
                Add New Address
            </base-button>
        </div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex';
import { Vuetable } from 'vuetable-2'
import _ from 'lodash'
import CopyAddressIcon from '@/components//Icons/CopyAddressIcon'
import EditAddressIcon from '@/components//Icons/EditAddressIcon'
import DeleteAddressIcon from '@/components//Icons/DeleteAddressIcon'
import AnimatedTablePagination from '@/components/AnimatedTable/AnimatedTablePagination'
import types from "~/types";

const tableFields = [
    {
        name: 'label',
        title: 'Label',
        sortField: 'label',
        width: "20%"
    },
    {
        name: 'address',
        title: 'Address',
        sortField: 'address',
        width: "50%"
    },
    {
        name: 'copy',
        width: "10%"
    },
    {
        name: "edit",
        width: '10%'
    },
    {
        name: "delete",
        width: "10%"
    }
];

export default {
    name: 'AddressBookPopup',
    components: {
        Vuetable,
        CopyAddressIcon,
        EditAddressIcon,
        DeleteAddressIcon,
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
        }),

        tableData () {
            const tableData = [];
            const dups = {};
            tableData.push({
                    label: "abc",
                    address: "xyz"
                });
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
        toggleCheckbox(isCheck, dataItem) {
            if (!isCheck) {
                this.selectedTx[dataItem.uniqId] = false;
                if (dataItem.status) {
                    this.totalSelected -= dataItem.amount
                }
                this.unselected[dataItem.uniqId] = true;
            } else {
                console.log('selectd:', dataItem.uniqId, ', address=', dataItem.address);
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

        copyAddress(dataItem) {
            console.log('Slider is toggled:', this.selectedTx[dataItem.uniqId]);
            if (dataItem.status && this.selectedTx[dataItem.uniqId]) {
                this.$refs.vuetable.unselectId(dataItem.uniqId);
                this.selectedTx[dataItem.uniqId] = false;
                this.totalSelected -= dataItem.amount
                this.unselected[dataItem.uniqId] = true;
            }
            dataItem.status = !dataItem.status;
        },

        editAddress(dataItem) {
            console.log('Slider is toggled:', this.selectedTx[dataItem.uniqId]);
            if (dataItem.status && this.selectedTx[dataItem.uniqId]) {
                this.$refs.vuetable.unselectId(dataItem.uniqId);
                this.selectedTx[dataItem.uniqId] = false;
                this.totalSelected -= dataItem.amount
                this.unselected[dataItem.uniqId] = true;
            }
            dataItem.status = !dataItem.status;
        },

        deleteAddress(dataItem) {
            console.log('Slider is toggled:', this.selectedTx[dataItem.uniqId]);
            if (dataItem.status && this.selectedTx[dataItem.uniqId]) {
                this.$refs.vuetable.unselectId(dataItem.uniqId);
                this.selectedTx[dataItem.uniqId] = false;
                this.totalSelected -= dataItem.amount
                this.unselected[dataItem.uniqId] = true;
            }
            dataItem.status = !dataItem.status;
        },

        addNewAddress() {

        },

        isLocked(dataItem) {
            return !dataItem.status;
        },
        closePopup() {
            this.$store.dispatch(types.app.OPEN_ADDRESS_BOOK, {open: false, address: ''});        
        }
    }
}
</script>


<style lang="scss" scoped>
    .address-book-popup {
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
                float: left;
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
