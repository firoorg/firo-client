<template>
    <base-popover
            :open="isOpen"
            placement="right-auto"
            popover-class="warning"
            boundaries-element="body"
            class="unexpected-transaction-popover advice"
            trigger="manually"
    >
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <header>
                <h2>Unexpected Payment Received</h2>
            </header>

            <p>
                Integer posuere erat a ante venenatis dapibus posuere velit aliquet.<br>
                Nullam id dolor id nibh ultricies vehicula ut id elit. <br>
                Nullam quis risus eget urna mollis ornare vel eu leo.
            </p>

            <footer>
                <base-button :is-outline="true">Mark as Notified</base-button>
                <base-button>Change To Subscription</base-button>
            </footer>
        </template>
    </base-popover>
</template>

<script>
    export default {
        name: 'UnexpectedTransactionPopover',
        props: [
            'boundariesElement',
            'isReused'
        ],

        computed: {
            isOpen () {
                return this.isReused
            }
        }
    }
</script>

<style scoped>

</style>
