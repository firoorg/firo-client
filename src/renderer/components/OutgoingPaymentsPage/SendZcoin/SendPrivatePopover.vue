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
                    <h2>{{ $t('send.public.flyout-suggest-private-spend.title') }}</h2>
                </header>

                <p v-html="$t('send.public.flyout-suggest-private-spend.description')" />

                <footer>
                    <base-button
                        :is-outline="true"
                        :is-dark="true"
                        @click.prevent="$emit('cancel')"
                        v-html="$t('send.public.flyout-suggest-private-spend.button__decline')"
                    />
                    <base-button
                        color="green"
                        :is-dark="true"
                        @click.prevent="$emit('submit')"
                        v-html="$t('send.public.flyout-suggest-private-spend.button__confirm')"
                    />
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
