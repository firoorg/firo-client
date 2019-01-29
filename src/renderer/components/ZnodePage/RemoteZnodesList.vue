<template>
    <animated-table
        class="remote-znode-list"
        :data="remoteZnodesSorted"
        :fields="tableFields"
        track-by="id"
        :per-page="100"
        :sort-order="sortOrder"
    />
</template>

<script>
/* eslint-disable vue/no-unused-components */
import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'
import Rank from '@/components/AnimatedTable/AnimatedTableZnodeRank'

const tableFields = [
    /*
        {
            name: PaymentRequestTableStatus,
            isFulfilledKey: 'isConfirmed',
            sortField: 'isConfirmed',
            width: '2rem'
        },
        {
            name: Amount,
            title: 'send.table__outgoing-payments.label__amount',
            sortField: 'amount',
            width: '25%'
        },
        */
    {
        name: Rank,
        title: 'znodes.overview.table__znodes.label__rank',
        sortField: 'rank',
        width: '10%'
    },
    {
        name: RelativeDate,
        title: 'znodes.overview.table__znodes.label__active-since',
        dateField: 'activeSince',
        sortField: 'activeSince',
        width: '20%'
    },
    {
        name: RelativeDate,
        title: 'znodes.overview.table__znodes.label__last-seen',
        dateField: 'lastSeen',
        sortField: 'lastSeen',
        width: '20%'
    },
    {
        name: 'status',
        title: 'znodes.overview.table__znodes.label__status',
        sortField: 'status',
        width: '25%'
    },
    {
        name: 'authority',
        title: 'znodes.overview.table__znodes.label__authority',
        sortField: 'label',
        formatter ({ ip, port }) {
            return `${ip}<span class="port">:${port}</span>`
        },
        width: '25%'
    }
]

export default {
    name: 'RemoteZnodesTable',

    components: {
        AnimatedTable,
        RelativeDate
    },

    props: {
        remoteZnodes: {
            type: Array,
            default: () => []
        }
    },

    data () {
        return {
            tableFields
        }
    },

    computed: {
        remoteZnodesSorted() {
            return [...this.remoteZnodes].sort((a, b) => a.firstSeenAt < b.firstSeenAt)
        },

        sortOrder () {
            return [
                {
                    sortField: 'rank',
                    direction: 'asc'
                }
            ]
        }
    }
}
</script>

<style scoped lang="scss">
.remote-znode-list /deep/ table.vuetable {
    border-collapse: separate;
    border-spacing: 0 1em;

    .vuetable-body {
        color: $color--comet-dark-mixed;

        tr {
            background: $color--white-light;
            //padding-bottom: emRhythm(3);
            //@include box-shadow-large();
            @include glow-small-box();
            cursor: default;
            //line-height: 40px;
        }

        td {
            border-top: 0;
            padding-top: emRhythm(2);
            padding-bottom: emRhythm(2);
        }
    }
}
</style>
