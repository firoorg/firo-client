<template>
    <div
        class="payment-request-table-status"
        :class="{ 'is-confirmed': isConfirmed }"
    >
        <tick-icon v-if="isConfirmed" />
        <outgoing-icon v-else />
    </div>
</template>

<script>
import TickIcon from '@/components/Icons/TickIcon'
import OutgoingIcon from '@/components/Icons/OutgoingIcon'

export default {
    name: 'PaymentRequestTableStatus',
    components: {
        OutgoingIcon,
        TickIcon
    },
    props: {
        isConfirmed: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style scoped>
    .payment-request-table-status {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    .payment-request-table-status svg {
        display: inline-block;
    }
</style>
