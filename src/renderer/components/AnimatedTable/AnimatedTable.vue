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
    // import Vue from 'vue'
    import Vuetable from 'vuetable-2/src/index'
    import VuetablePagination from 'vuetable-2/src/components/VuetablePagination'
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
                perPage: 5,
                rowTransition: 'fade'
                /*
                data: [
                    {'id': 1, 'name': 'Noelia O\'Kon', 'nickname': 'asperiores', 'email': 'otho.smitham@example.com', 'birthdate': '1978-06-28 00:00:00', 'gender': 'F', 'salary': '13098.00', 'group_id': 2, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 39, 'group': {'id': 2, 'name': 'Exec', 'description': 'Executives'}, 'address': {'id': 1, 'user_id': 1, 'line1': '0888 Aniyah Locks\nLake Bridie, NJ 51086', 'line2': 'Cayman Islands', 'zipcode': '92991-2805', 'mobile': '1-742-816-9238x848', 'fax': '(484)438-4697x8638'}}, {'id': 2, 'name': 'Mr. Enid Von PhD', 'nickname': 'alias', 'email': 'pollich.cecilia@example.com', 'birthdate': '1990-09-18 00:00:00', 'gender': 'M', 'salary': '35978.00', 'group_id': 4, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 27, 'group': {'id': 4, 'name': 'Sup', 'description': 'Supervisors'}, 'address': {'id': 2, 'user_id': 2, 'line1': '59732 Iva Spur Suite 468\nEast Hortenseton, VA 70087', 'line2': 'Cayman Islands', 'zipcode': '41967', 'mobile': '1-913-407-7558x503', 'fax': '(388)906-8002'}}, {'id': 3, 'name': 'Colton Koch', 'nickname': 'id', 'email': 'little.myrna@example.net', 'birthdate': '1968-10-29 00:00:00', 'gender': 'F', 'salary': '26278.00', 'group_id': 3, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 49, 'group': {'id': 3, 'name': 'Mgr', 'description': 'Managers'}, 'address': {'id': 3, 'user_id': 3, 'line1': '539 Conn Locks Suite 801\nTobinfort, IL 37047-5508', 'line2': 'Antigua and Barbuda', 'zipcode': '51722-4502', 'mobile': '557.845.1830x844', 'fax': '1-831-304-7444x73027'}}, {'id': 4, 'name': 'Gregory Vandervort', 'nickname': 'vel', 'email': 'dock47@example.org', 'birthdate': '1989-12-12 00:00:00', 'gender': 'M', 'salary': '25537.00', 'group_id': 3, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 28, 'group': {'id': 3, 'name': 'Mgr', 'description': 'Managers'}, 'address': {'id': 4, 'user_id': 4, 'line1': '916 Rosemary Forge\nKreigerton, MT 24207', 'line2': 'Uganda', 'zipcode': '67639-6707', 'mobile': '766.431.9121', 'fax': '(154)336-3674x08451'}}, {'id': 5, 'name': 'Miss Rahsaan Heaney IV', 'nickname': 'qui', 'email': 'ugrady@example.org', 'birthdate': '1995-11-27 00:00:00', 'gender': 'F', 'salary': '49003.00', 'group_id': 2, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 22, 'group': {'id': 2, 'name': 'Exec', 'description': 'Executives'}, 'address': {'id': 5, 'user_id': 5, 'line1': '91792 Kertzmann Prairie Apt. 376\nLake Nakiaville, DC 98189', 'line2': 'Jamaica', 'zipcode': '10101-1450', 'mobile': '07507519787', 'fax': '+24(9)5120507985'}}, {'id': 6, 'name': 'Ms. Crystel Zemlak IV', 'nickname': 'reiciendis', 'email': 'amari.rau@example.com', 'birthdate': '1968-09-12 00:00:00', 'gender': 'F', 'salary': '12383.00', 'group_id': 4, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 49, 'group': {'id': 4, 'name': 'Sup', 'description': 'Supervisors'}, 'address': {'id': 6, 'user_id': 6, 'line1': '97650 Scot Haven Apt. 160\nCrawfordmouth, ME 39767-7003', 'line2': 'Finland', 'zipcode': '88917', 'mobile': '1-851-069-9234x9566', 'fax': '(048)445-4691x33356'}}, {'id': 7, 'name': 'Nona McDermott', 'nickname': 'quaerat', 'email': 'adrien.baumbach@example.org', 'birthdate': '1985-10-01 00:00:00', 'gender': 'F', 'salary': '18512.00', 'group_id': 4, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 32, 'group': {'id': 4, 'name': 'Sup', 'description': 'Supervisors'}, 'address': {'id': 7, 'user_id': 7, 'line1': '4332 Alvina Radial\nPort Darbyville, IA 63357', 'line2': 'Barbados', 'zipcode': '79679', 'mobile': '(736)058-1324', 'fax': '002.234.8466x49816'}}, {'id': 8, 'name': 'Miss Genoveva Murazik V', 'nickname': 'rerum', 'email': 'ohettinger@example.net', 'birthdate': '1988-10-19 00:00:00', 'gender': 'F', 'salary': '31209.00', 'group_id': 2, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 29, 'group': {'id': 2, 'name': 'Exec', 'description': 'Executives'}, 'address': {'id': 8, 'user_id': 8, 'line1': '96418 Ritchie Mall Apt. 215\nLake Jessyca, VT 65970-8256', 'line2': 'Netherlands Antilles', 'zipcode': '94649-6628', 'mobile': '472.825.7183', 'fax': '400-507-7463'}}, {'id': 9, 'name': 'Beulah Huels', 'nickname': 'non', 'email': 'stefan99@example.com', 'birthdate': '1963-09-04 00:00:00', 'gender': 'F', 'salary': '36920.00', 'group_id': 5, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 54, 'group': {'id': 5, 'name': 'Emp', 'description': 'Employees'}, 'address': {'id': 9, 'user_id': 9, 'line1': '18890 Carroll Lakes Suite 355\nUptonchester, UT 94878-0739', 'line2': 'Hong Kong', 'zipcode': '91204', 'mobile': '831.652.0832', 'fax': '(688)788-8947'}}, {'id': 10, 'name': 'Zoe Klein', 'nickname': 'ex', 'email': 'ejacobson@example.org', 'birthdate': '1990-04-19 00:00:00', 'gender': 'F', 'salary': '35616.00', 'group_id': 3, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 28, 'group': {'id': 3, 'name': 'Mgr', 'description': 'Managers'}, 'address': {'id': 10, 'user_id': 10, 'line1': '6721 Nader Summit\nLake Alana, MS 84476', 'line2': 'Reunion', 'zipcode': '77124-1459', 'mobile': '1-129-438-6148', 'fax': '(913)441-3846'}}, {'id': 11, 'name': 'Vickie Kiehn', 'nickname': 'assumenda', 'email': 'ayost@example.com', 'birthdate': '1988-04-20 00:00:00', 'gender': 'F', 'salary': '30790.00', 'group_id': 3, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 30, 'group': {'id': 3, 'name': 'Mgr', 'description': 'Managers'}, 'address': {'id': 11, 'user_id': 11, 'line1': '763 McCullough Ville\nNew Thomasstad, HI 64611', 'line2': 'Oman', 'zipcode': '00642', 'mobile': '1-296-172-2126x275', 'fax': '(559)203-8694'}}, {'id': 12, 'name': 'Elwyn Herzog', 'nickname': 'praesentium', 'email': 'ckassulke@example.net', 'birthdate': '1990-01-22 00:00:00', 'gender': 'M', 'salary': '35785.00', 'group_id': 1, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 28, 'group': {'id': 1, 'name': 'Admin', 'description': 'Administrators'}, 'address': {'id': 12, 'user_id': 12, 'line1': '65641 Baron Spurs Suite 988\nNorth Ivah, IA 92235', 'line2': 'Nepal', 'zipcode': '90316-7411', 'mobile': '064.482.9432x9456', 'fax': '05936098280'}}, {'id': 13, 'name': 'Selena Hettinger', 'nickname': 'et', 'email': 'bashirian.hyman@example.net', 'birthdate': '1981-10-01 00:00:00', 'gender': 'F', 'salary': '31836.00', 'group_id': 5, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 36, 'group': {'id': 5, 'name': 'Emp', 'description': 'Employees'}, 'address': {'id': 13, 'user_id': 13, 'line1': '42272 Stoltenberg Points Suite 006\nLake Dustin, NH 70213-2043', 'line2': 'Uganda', 'zipcode': '60996-2982', 'mobile': '(508)122-5892', 'fax': '356-682-2023x07379'}}, {'id': 14, 'name': 'Edwin Beier', 'nickname': 'eos', 'email': 'janis71@example.org', 'birthdate': '1978-10-13 00:00:00', 'gender': 'M', 'salary': '11902.00', 'group_id': 1, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 39, 'group': {'id': 1, 'name': 'Admin', 'description': 'Administrators'}, 'address': {'id': 14, 'user_id': 14, 'line1': '362 Trantow Loop Apt. 150\nLake Marafurt, DC 27926', 'line2': 'Gabon', 'zipcode': '36943-1099', 'mobile': '033-386-4972x26066', 'fax': '1-363-037-1381'}}, {'id': 15, 'name': 'Lexi Braun MD', 'nickname': 'autem', 'email': 'dusty74@example.net', 'birthdate': '1971-12-07 00:00:00', 'gender': 'F', 'salary': '11927.00', 'group_id': 4, 'created_at': '2017-01-01 07:21:10', 'updated_at': '2017-01-01 07:21:10', 'age': 46, 'group': {'id': 4, 'name': 'Sup', 'description': 'Supervisors'}, 'address': {'id': 15, 'user_id': 15, 'line1': '6737 Schimmel Crossing Suite 720\nShieldsberg, AK 44558', 'line2': 'Tanzania', 'zipcode': '75615', 'mobile': '338.920.3112', 'fax': '(467)912-6668'}}
                ]
                */
            }
        },

        mounted () {
            console.log('animated table created', this.$scopedSlots)
        },

        /*
        mounted () {
            let i = 1
            const tmpData = JSON.parse(JSON.stringify(this.data))

            if (this.interval) {
                clearInterval(this.interval)
            }

            this.interval = setInterval(() => {
                const pos = Math.floor(Math.random() * this.data.length)

                if (Math.random() > 0.5 && this.data.length > 6) {
                } else {
                    const d = tmpData[Math.floor(Math.random() * this.data.length)]
                    const newItem = {
                        ...d,
                        id: tmpData.length + i
                    }

                    this.data.splice(pos, 0, newItem)
                }

                i++
            }, 5000)
        },
        */

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

                // this.selectedRow = id

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
            // border: 1px solid red;

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