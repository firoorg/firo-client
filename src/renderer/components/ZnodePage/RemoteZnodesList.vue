<template>
    <animated-table
        :data="remoteZnodes"
        :fields="tableFields"
        track-by="id"
        :per-page="100"
        :sort-order="[{ field: 'firstSeenAt', direction: 'desc' }]"
    />
</template>

<script>
import AnimatedTable from '@/components/AnimatedTable/AnimatedTable'
import RelativeDate from '@/components/AnimatedTable/AnimatedTableRelativeDate'

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
        name: 'rank',
        title: 'Rank',
        sortField: 'rank'
    },
    {
        name: RelativeDate,
        title: 'Active Since',
        dateField: 'activeSince',
        sortField: 'activeSince'
    },
    {
        name: RelativeDate,
        title: 'Last Seen',
        // title: 'znodes.table__remote-znodes.label__lastSeen',
        dateField: 'lastSeen',
        sortField: 'lastSeen',
        width: '30%'
    },
    {
        name: 'status',
        title: 'Status',
        sortField: 'status'
    },
    {
        name: 'authority',
        title: 'Authority',
        sortField: 'label',
        formatter ({ ip, port }) {
            return `${ip}<span class="port">:${port}</span>`
        }
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
    }
}
</script>

<style scoped>

</style>
