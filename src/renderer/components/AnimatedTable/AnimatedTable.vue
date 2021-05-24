<template>
    <div class="animated-table">
        <div class="table-container" ref="table-container">
            <vuetable
                ref="vuetable"
                :api-mode="false"
                :fields="getFieldsWithLocalizedTitle"
                :per-page="perPage"
                :track-by="trackBy"
                :data-manager="dataManager"
                pagination-path="pagination"
                :row-transition-name="rowTransition"
                :no-data-template="noDataMessage"
                v-bind="{ scopedSlots: $scopedSlots }"
                :row-class="rowClass"
                @vuetable:pagination-data="onPaginationData"
                @vuetable:row-clicked="onRowClick"
                @vuetable:field-event="(ev) => $emit('field-event', ev)"
            />
        </div>

        <div class="table-pagination">
            <animated-table-pagination
                ref="pagination"
                :theme="theme"
                @vuetable-pagination:change-page="onChangePage"
            />
        </div>
    </div>
</template>

<script>
import { Vuetable } from 'vuetable-2'
import AnimatedTablePagination from './AnimatedTablePagination'
import _ from 'lodash'

export default {
    name: 'AnimatedTable',
    components: {
        Vuetable,
        AnimatedTablePagination
    },
    props: {
        fields: {
            type: Array,
            required: true
        },
        data: {
            type: Array,
            required: true
        },
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
        noDataMessage: {
            type: String,
            default: ''
        },
        selectedRow: {
            type: String,
            default: null
        },
        onRowSelect: {
            type: Function,
            default: null
        },
        onPageChange: {
            type: Function,
            default: (newPage) => null
        },
        theme: {
            type: String,
            default: ''
        },
        // This is used to check if data has changed and we need to refresh the table. Yes, it's really needed, despite
        // the reactive nature of Vue, as oftentimes data gets recalculated without actually changing the result, and we
        // don't want the user to get sent back to page 1 unless the table itself actually changes, even if some of the
        // things that went into calculating it did.
        compareElements: {
            type: Function,
            default: (a, b) => a === b
        },
        rowClass: {
            type: Function | String,
            default: ''
        },
        globalData: {
            type: Object,
            required: false
        },
        // FIXME: For reasons I haven't been able to figure out, flex-grow will cause .table-container to sometimes
        //        outgrow the available space. This sets our table to be smaller so that won't happen. It seems to only
        //        be necessary when AnimatedTable is embedded in Popup, which happens in InputSelection.
        antiOverflowHack: {
            type: Boolean,
            default: false
        }
    },

    data () {
        return {
            interval: null,
            rowTransition: 'fade',
            perPage: 0,
            resizeListener: () => this.setPerPage()
        }
    },

    computed: {
        getFieldsWithLocalizedTitle () {
            return this.fields.map((field) => {
                return {
                    ...field,
                    title: this.$t(field.title)
                }
            })
        }
    },

    watch: {
        data (newVal, oldVal) {
            let isEqual = true

            if (newVal.length === oldVal.length) {
                for (const i in newVal) {
                    if (!this.compareElements(newVal[i], oldVal[i])) {
                        isEqual = false
                        break
                    }
                }
            } else {
                isEqual = false
            }

            if (!isEqual) {
                this.$refs.vuetable.refresh()
                this.onPageChange(1);

                this.$nextTick(() => this.resizeListener());
            }
        }
    },

    mounted() {
        window.addEventListener("resize", this.resizeListener);

        this.$nextTick(() => {
            if (!this.$refs.vuetable) return;
            this.$refs.vuetable.globalData = this.globalData;
            this.setPerPage();
        });
    },

    destroyed() {
        window.removeEventListener("resize", this.resizeListener);
    },

    methods: {
        setPerPage() {
            this.perPage = 0;
            this.$nextTick(() => {
                const tableContainer = document.querySelector('.table-container');
                const tableHeader = document.querySelector('.table-container th');
                const tableRow = document.querySelector('.table-container td');
                if (tableContainer && tableHeader && tableRow) {
                    this.perPage = Math.floor((tableContainer.clientHeight - tableHeader.clientHeight) / tableRow.clientHeight);
                    if (this.antiOverflowHack) this.perPage -= 2;
                    this.$refs.vuetable.refresh();
                }
            });
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
            this.onPageChange(page);
        },

        dataManager (sortOrder, pagination) {
            if (this.data.length < 1) {
                return {
                    data: []
                }
            }

            let local = this.data

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
        }
    }
}
</script>

<style lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/sizes";

.animated-table {
    display: flex;
    flex-flow: column;
    justify-content: flex-end;
}

.table-container {
    flex-grow: 1;
}

.animated-table {
    .vuetable-body-wrapper {
        & > table {
            width: 100%;
            border-collapse: collapse;
        }
    }

    tr {
        text-align: left;

        td, th {
            &:first-child {
                padding-left: $size-table-row-horizontal-padding;
            }

            &:last-child {
                padding-right: $size-table-row-horizontal-padding;
            }
        }

        th {
            padding-bottom: 1em;
            font-weight: bold;
            color: var(--color-table-heading);
        }
    }

    .vuetable-body {
        tr {
            cursor: pointer;
            box-sizing: border-box;

            // alternating colours for different rows
            &:nth-child(odd) {
                background: var(--color-darkened-table-background);
            }
            &:nth-child(even) {
                background: var(--color-table-background);
            }

            // highlight on hover
            &:hover {
                td {
                    background: var(--color-lightened-table-background);
                }
            }

            td {
                padding: {
                    top: $size-table-row-vertical-padding;
                    bottom: $size-table-row-vertical-padding;
                }
            }
        }
    }
}
</style>
