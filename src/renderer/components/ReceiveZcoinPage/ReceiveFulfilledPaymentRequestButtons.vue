<template>
    <div>
        <base-button @click.prevent="openBlockExplorer">
            {{ $t('receive.detail-entry-request.fulfilled.button__open-explorer') }}
        </base-button>
    </div>
</template>

<script>
import { shell } from 'electron'
import { mapGetters } from 'vuex'

export default {
    name: 'ReceiveFulfilledPaymentRequestButtons',

    props: {
        address: {
            type: String,
            required: true
        }
    },

    computed: {
        ...mapGetters({
            getExplorerAddressUrl: 'Settings/getExplorerAddressUrl'
        })
    },

    methods: {
        openBlockExplorer (event) {
            event.preventDefault()

            shell.openExternal(this.getExplorerAddressUrl(this.address))
        }
    }
}
</script>

<style scoped>

</style>
