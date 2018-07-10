<template>
    <div class="animated-table">
        <vuetable ref="vuetable"
                  :api-mode="false"
                  :fields="fields"
                  :per-page="perPage"
                  :track-by="trackBy"
                  :data-manager="dataManager"
                  pagination-path="pagination"
                  :row-transition-name="rowTransition"
                  :row-class="getRowClass"
                  @vuetable:pagination-data="onPaginationData"
                  @vuetable:row-clicked="onRowClick"
                  v-bind="{ scopedSlots: $scopedSlots }"
        >
        </vuetable>

        <div>
            <vuetable-pagination ref="pagination"
                                 @vuetable-pagination:change-page="onChangePage"
            ></vuetable-pagination>
        </div>
    </div>
</template>

<script>
    import { Vuetable, VuetablePagination } from 'vuetable-2'
    // import Vuetable from 'vuetable-2/src/index'
    // import VuetablePagination from 'vuetable-2/src/components/VuetablePagination'
    // import VuetableFieldHandle from 'vuetable-2/src/components/VuetableFieldHandle.vue'
    import _ from 'lodash'

    // import AnimatedTableRelativeDate from '@/components/AnimatedTableRelativeDate'

    // Vue.component('vuetable-field-component:relative-date', AnimatedTableRelativeDate)

    export default {
        name: 'AnimatedTable',
        components: {
            Vuetable,
            VuetablePagination
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
            selectedRow: {
                type: String,
                default: null
            },
            onRowSelect: {
                type: Function,
                default: null
            }
        },

        data () {
            return {
                interval: null,
                perPage: 10,
                rowTransition: 'fade'
            }
        },

        mounted () {
            console.log('animated table created', this.$scopedSlots)
        },

        watch: {
            data (newVal, oldVal) {
                this.$refs.vuetable.refresh()
            }
        },

        methods: {
            getRowClass (item, index) {
                return item[this.trackBy] === this.selectedRow ? 'selected' : ''
            },

            onRowClick (rowData) {
                const { data, index, event } = rowData

                console.log(data[this.trackBy], data, this.trackBy)

                if (data[this.trackBy] === this.selectedRow) {
                    return
                }

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
                console.log('DATAMANAGER CALLED!')
                if (this.data.length < 1) return

                let local = this.data

                // sortOrder can be empty, so we have to check for that as well
                if (sortOrder.length > 0) {
                    console.log('orderBy:', sortOrder[0].sortField, sortOrder[0].direction)
                    local = _.orderBy(
                        local,
                        sortOrder[0].sortField,
                        sortOrder[0].direction
                    )
                }

                pagination = this.$refs.vuetable.makePagination(
                    local.length,
                    this.perPage
                )
                console.log('pagination:', pagination)
                let from = pagination.from - 1
                let to = from + this.perPage

                return {
                    pagination: pagination,
                    data: _.slice(local, from, to)
                }
            },
            onActionClicked (action, data) {
                console.log('slot actions: on-click', data.name)
            }
        }
    }
</script>

<style lang="scss">
    .animated-table {
        .vuetable-body-wrapper {
            & > table {
                width: 100%;
                border-collapse: collapse;
            }
        }

        thead {
            text-align: left;

            th {
                @include font-heavy();
                color: $color--comet-dark;
                padding-bottom: emRhythm(2);

                &.sortable {
                    transition: color 0.15s ease-out;

                    &:hover {
                        color: $color--dark;
                    }

                }
            }
        }

        .vuetable-body {
            tr {
                $padding: 1;
                $border-size: 1px;

                $hover-opacity: .35;
                $hover-background-color: $color--polo-medium;

                $odd-opacity: .15;
                $odd-background-color: $color--polo-medium;

                cursor: pointer;
                position: relative;
                @include glow-transition-start($color--green);

                transition: box-shadow 0.15s ease-out;

                td {
                    position: relative;
                    border-color: $color--polo-medium;
                    // border-color: #fff;
                    border-top-style: solid;
                    @include rhythmBorderTop($border-size, $padding);
                    padding-bottom: emRhythm($padding);
                    transition: background-color .15s ease-in-out;

                    &:first-child {
                        margin-left: -1rem;
                        padding-left: 1rem;
                    }
                    /*&:after {
                        border-bottom: 1px solid #fff;
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 1;

                        content: '';
                        width: 100%;
                    }*/
                }

                &:last-child td {
                    border-bottom-style: solid;
                    @include rhythmBorderBottom($border-size, $padding);
                }

                &:nth-child(odd) {
                    background: rgba($odd-background-color, $odd-opacity);
                }

                &:hover {
                    &:nth-child(odd) {
                        td {
                            background: rgba($hover-background-color, $hover-opacity + $odd-opacity);
                        }
                    }

                    td {
                        background: rgba($hover-background-color, $hover-opacity);
                    }
                }

                &.selected {
                    position: relative;
                    z-index: 1000;

                    /*&:before {
                        position: absolute;
                        top: 0;
                        left: 0;

                        content: '';
                        width: 100%;
                        //height: 100%;
                        background: red;
                        border: 10px solid blue;
                    }*/
                    @include glow-small-box($color--green);

                    td {
                        background: $color--green;
                        color: $color--white;
                    }

                    & /deep/ .tag {
                        border-color: mix($color--green, $color--green-dark);
                    }

                    &:hover td {
                        background: mix($color--green-bright, $color--green, (100% * $hover-opacity));
                    }

                    &:nth-child(odd) {
                        td {
                            background: mix($color--green-bright, $color--green, (100% * $odd-opacity / 2));
                        }

                        &:hover td {
                            background: mix($color--green-bright, $color--green, (100% * ($hover-opacity + $odd-opacity) / 2));
                        }
                    }
                }
            }

            &.fade-enter,
            &.fade-enter-active {
                background: red;
            }

            &.fade-leave-to {
                background: blue;
            }
        }

        .pagination {
            border: 1px solid red;
            margin-top: emRhythm(3);
            text-align: center;

            a {
                display: inline-block;
                padding: emRhythm(1) emRhythm(2);
                // border: 1px solid green;
                background-color: rgba($color--polo-medium, 0.5);
                color: $color--comet;
                @include font-heavy();
                cursor: pointer;

                &.active {
                    color: $color--comet-dark;
                    @include font-black();
                }
            }
        }
    }
</style>