<template>
    <div
        class="payments"
        :class="{ 'show-validate': showValidate }"
    >
        <div
            v-for="(value, key) in payments"
            :key="key"
        >
        </div>
    </div>
</template>

<script>
export default {
    name: 'PendingPayments',
    props: {
        showValidate: {
            type: Boolean,
            default: true
        },

        payments: {
            type: Array,
            required: true
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
