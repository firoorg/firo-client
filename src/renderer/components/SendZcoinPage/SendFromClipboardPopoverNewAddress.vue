<template>
    <div>
        <header>
            <h2>Zcoin Address found</h2>
        </header>

        <p>
            Found a Zcoin address in your clipboard.<br>
            Would you like to use it as the recipient address to send Zcoin?
        </p>

        <div>
            <footer>
                <base-button :is-outline="true"
                             :is-dark="true"
                             @click.prevent="markAsNotified">
                    Nope
                </base-button>
                <base-button color="green"
                             :is-dark="true"
                             @click.prevent="setSendFormFields">
                    Yes, go ahead!
                </base-button>
            </footer>
        </div>
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