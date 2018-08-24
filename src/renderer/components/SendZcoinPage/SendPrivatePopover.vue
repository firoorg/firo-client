<template>
    <base-popover
            :open="isOpen"
            trigger="manual"
            placement="left-end"
            :offset="8*3"
            popover-class="advice"
            :boundaries-element="boundariesElement"
    >
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <h2>Note: Private Payment</h2>
            <p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>
            <footer>
                <base-button :is-outline="true"
                             :is-dark="true"
                             @click.prevent="$emit('cancel')">
                    No, thanks
                </base-button>
                <base-button color="green"
                             :is-dark="true"
                             @click.prevent="$emit('submit')">
                    Yes, switch to private
                </base-button>
            </footer>
        </template>
    </base-popover>
</template>

<script>
    export default {
        name: 'SendPrivatePopover',

        props: {
            boundariesElement: {
                type: HTMLElement,
                required: true
            },

            isOpen: {
                type: Boolean,
                required: true
            }
        },

        computed: {

        },

        methods: {

        }
    }
</script>

<style scoped>

</style>