<template>
    <div class="animated-table">
        <vuetable
            ref="vuetable"
            :api-mode="false"
            :fields="getFieldsWithLocalizedTitle"
            :per-page="perPage"
            :track-by="trackBy"
            :sort-order="sortOrder"
            :data-manager="dataManager"
            pagination-path="pagination"
            :row-transition-name="rowTransition"
            :row-class="getRowClass"
            :no-data-template="noDataMessage"
            v-bind="{ scopedSlots: $scopedSlots }"
            @vuetable:pagination-data="onPaginationData"
            @vuetable:row-clicked="onRowClick"
        />

        <div>
            <vuetable-pagination
                ref="pagination"
                @vuetable-pagination:change-page="onChangePage"
            />
        </div>
    </div>
</template>

<script>
import { Vuetable, VuetablePagination } from 'vuetable-2'
import _ from 'lodash'

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
            default: ''
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
            rowTransition: 'fade'
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
            this.$refs.vuetable.refresh()
        }
    },

    methods: {
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

            console.log(data[this.trackBy], data, this.trackBy)

            /*
                if (data[this.trackBy] === this.selectedRow) {
                    return
                }
                */

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
            if (this.data.length < 1) {
                return {
                    data: []
                }
            }

            let local = this.data

            // sortOrder can be empty, so we have to check for that as well
            if (sortOrder.length > 0) {
                // console.log('orderBy:', sortOrder[0].sortField, sortOrder[0].direction)
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
            // console.log('pagination:', pagination)
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
                    position: relative;

                    &:hover {
                        color: $color--dark;

                        .sort-icon {
                            color: $color--comet-dark;
                        }
                    }

                    .sort-icon {
                        float: none !important;
                        display: inline-block;
                        color: $color--comet;
                        padding-left: 0.5rem;
                        // border: 1px solid blue;
                        position: absolute !important;

                        @include setType(1);
                        font-style: normal;
                        //transition: transform 0.25s ease-in-out;

                        &:after {
                            transition: all 0.25s ease-in-out;
                        }


                        &.sort {
                            top: 0.75rem;
                            padding-left: 0.35rem;

                            &:after {
                                // border: 1px solid red;

                                //@include setType(1, $ms-up1);
                                display: block;
                                content: '‹›';
                                transform: rotate(90deg);
                            }
                        }

                        &.up,
                        &.down {
                            @include setType(1, $ms-up2);
                            //height: 1.25rem;
                            top: 0.45rem;
                            padding-left: 0.75rem;
                            box-sizing: border-box;
                            position: relative;


                            &:after {
                                top: 50%;
                                left: 50%;
                                display: block;
                                position: absolute;
                                //border: 1px solid red;
                                width: 0.5rem;
                                height: 0.75rem;
                                content: '‹';
                                transform: rotate(270deg);
                            }
                        }

                        &.down {
                            &:after {
                                transform: rotate(90deg);
                            }
                        }

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

                &.is-reused {
                    @include glow-transition-start($color--orange);
                }

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
                    @include glow-small-box($color--comet-dark-mixed);

                    &.is-fulfilled {
                        @include glow-small-box($color--green);

                        td {
                            background: $color--green;
                        }

                        & /deep/ .tag {
                            border-color: mix($color--comet-dark-mixed, $color--comet-dark);
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

                    &.is-incoming {
                        /deep/ .payment-request-table-status path {
                            fill: $color--white;
                        }
                    }

                    &.is-reused {
                        @include glow-small-box($color--orange);

                        td {
                            background: $color--orange;
                        }

                        & /deep/ .tag {
                            border-color: mix($color--orange, $color--orange-dark);
                        }

                        &:hover td {
                            background: mix($color--orange-bright, $color--orange, (100% * $hover-opacity));
                        }

                        &:nth-child(odd) {
                            td {
                                background: mix($color--orange-bright, $color--orange, (100% * $odd-opacity / 2));
                            }

                            &:hover td {
                                background: mix($color--orange-bright, $color--orange, (100% * ($hover-opacity + $odd-opacity) / 2));
                            }
                        }
                    }

                    & /deep/ .tag {
                        border-color: mix($color--green, $color--green-dark);
                    }

                    & /deep/ .payment-request-table-status {
                        &.is-fulfilled path {
                            stroke: $color--white;
                        }

                        &:not(.is-fulfilled) g {
                            fill: $color--white;
                        }
                    }

                    td {
                        background: $color--comet-dark-mixed;
                        color: $color--white;
                    }

                    &:hover td {
                        background: mix($color--comet-dark-mixed, $color--polo, (100% * $hover-opacity));
                    }

                    &:nth-child(odd) {
                        td {
                            background: rgba($color--comet-dark-mixed, (100% * $odd-opacity / 2));
                        }

                        &:hover td {
                            background: mix($color--comet-dark-mixed, $color--polo, (100% * ($hover-opacity + $odd-opacity) / 2));
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
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: emRhythm(3);
            //border: 1px solid red;
            text-align: center;

            a {
                display: inline-block;
                padding: emRhythm(1) emRhythm(2);
                // border: 1px solid green;
                &:not(.icon) {
                    background-color: rgba($color--polo-medium, 0.5);
                }

                /*&.icon + a:not(.icon),
                &:not(.icon) + :not(.icon) {
                    border: 1px solid red;
                }*/

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
