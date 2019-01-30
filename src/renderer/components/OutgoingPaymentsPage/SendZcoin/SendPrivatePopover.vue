<template>
    <base-popover
        :open="isOpen"
        trigger="manual"
        placement="left-end"
        :offset="8*3"
        popover-class="advice private"
    >
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <div>
                <header>
                    <h2>Private Spend</h2>
                </header>

                <p>
                    You have enough mints available to make that payment privately.<br>
                    Would you like to do so?
                </p>

                <footer>
                    <base-button
                        :is-outline="true"
                        :is-dark="true"
                        @click.prevent="$emit('cancel')"
                    >
                        No, thanks
                    </base-button>
                    <base-button
                        color="green"
                        :is-dark="true"
                        @click.prevent="$emit('submit')"
                    >
                        Yes, switch to <em>Private Spend</em>
                    </base-button>
                </footer>
            </div>
        </template>
    </base-popover>
</template>

<script>
export default {
    name: 'SendPrivatePopover',

    props: {
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
