<template>
    <div>
        <header>
            <h2>Zcoin Address found (used, private)</h2>
        </header>

        <p>
            Found a Zcoin USED address in your clipboard.<br>
            ...
        </p>

        <div>
            <footer>
                <base-button :is-dark="true"
                             @click.prevent="markAsNotified">
                    Nope
                </base-button>
                <base-button :is-outline="true"
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
        name: 'SpendZerocoinFromClipboardPopoverUsedAddress',
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