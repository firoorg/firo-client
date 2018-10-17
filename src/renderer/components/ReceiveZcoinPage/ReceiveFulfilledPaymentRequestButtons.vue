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
                isTestnet: 'Blockchain/isTestnet'
            })
        },

        methods: {
            openBlockExplorer (event) {
                event.preventDefault()

                const explorerUrl = this.isTestnet ? 'https://testexplorer.zcoin.io/address/' : 'https://explorer.zcoin.io/address/'

                shell.openExternal(`${explorerUrl}${this.address}`)
            }
        }
    }
</script>

<style scoped>

</style>
