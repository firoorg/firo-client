<template>
    <base-popover
            :open="isOpen"
            placement="right-end"
            popover-class="warning"
            boundaries-element="body"
            class="unexpected-transaction-popover advice"
            trigger="manually"
    >
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <h1>Unexpected Payment Received</h1>

            <p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>
        </template>
    </base-popover>
</template>

<script>
    export default {
        name: 'UnexpectedTransactionPopover',
        props: [
            'boundariesElement'
        ],

        computed: {
            isOpen () {
                return true
            }
        }
    }
</script>

<style scoped>

</style>