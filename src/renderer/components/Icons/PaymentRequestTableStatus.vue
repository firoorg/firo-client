<template>
    <div class="payment-request-table-status" :class="{ 'is-fulfilled': isFulfilled }">
        <svg v-if="isFulfilled" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m6.5-1.5 4 4-9 8" fill="none" :stroke="tickColor" stroke-linecap="round" stroke-width="2" transform="matrix(0 1 1 0 3.5 1.5)"/></svg>
        <svg v-else height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><g fill="#53537a" fill-rule="evenodd"><circle cx="12.5" cy="9" r="1.25"/><circle cx="3.5" cy="9" r="1.25"/><circle cx="8" cy="9" r="1.25"/></g></svg>
    </div>
</template>

<script>
    export default {
        name: 'PaymentRequestTableStatus',
        props: {
            isFulfilled: {
                type: Boolean
            },
            isReused: {
                type: Boolean
            }
        },

        computed: {
            tickColor () {
                return this.isReused ? '#FA8C0F' : '#23b852'
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