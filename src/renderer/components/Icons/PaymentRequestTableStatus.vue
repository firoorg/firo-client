<template>
    <div
        class="payment-request-table-status"
        :class="{ 'is-fulfilled': isFulfilled }"
    >
        <tick-icon
            v-if="isFulfilled"
            :color="tickColor"
        />
        <incoming-icon v-else-if="isIncoming" />
        <svg
            v-else
            height="16"
            viewBox="0 0 16 16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g
                fill="#53537a"
                fill-rule="evenodd"
            >
                <circle
                    cx="12.5"
                    cy="9"
                    r="1.25"
                /><circle
                    cx="3.5"
                    cy="9"
                    r="1.25"
                /><circle
                    cx="8"
                    cy="9"
                    r="1.25"
                />
            </g>
        </svg>
    </div>
</template>

<script>
import TickIcon from 'renderer/components/Icons/TickIcon'
import IncomingIcon from 'renderer/components/Icons/IncomingIcon'

export default {
    name: 'PaymentRequestTableStatus',
    components: {
        IncomingIcon,
        TickIcon
    },
    props: {
        isFulfilled: {
            type: Boolean,
            default: false
        },
        isIncoming: {
            type: Boolean,
            default: false
        },
        isReused: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        tickColor () {
            return this.isReused ? 'warning' : 'green'
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
