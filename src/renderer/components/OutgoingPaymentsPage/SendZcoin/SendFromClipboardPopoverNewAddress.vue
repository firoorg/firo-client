<template>
    <div>
        <header>
            <h2 v-html="$t('send.public.flyout-unused-address.title')" />
        </header>

        <p v-html="$t('send.public.flyout-unused-address.description')" />

        <footer>
            <base-button
                :is-outline="true"
                :is-dark="true"
                @click.prevent="markAsNotified"
            >
                Nope
            </base-button>
            <base-button
                color="green"
                :is-dark="true"
                @click.prevent="setSendFormFields"
            >
                Yes, go ahead!
            </base-button>
        </footer>
    </div>
</template>

<script>
export default {
    name: 'SendFromClipboardPopoverNewAddress',
    props: {
        markAsNotified: {
            type: Function,
            required: true
        },

        setSendFormFields: {
            type: Function,
            required: true
        }
    }
}
</script>

<style scoped>

</style>
