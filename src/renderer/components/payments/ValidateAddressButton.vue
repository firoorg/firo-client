<template>
    <a
        href="#"
        class="validate-address"
        @click.prevent="validateAddress"
    >
        Show Address
    </a>
</template>

<script>
import { mapActions } from 'vuex'
import types from '~/types'

export default {
    name: 'ValidateAddressButton',

    props: {
        address: {
            type: String,
            required: true
        },

        label: {
            type: String,
            default: ''
        },

        amount: {
            type: String,
            default: ''
        }
    },

    methods: {
        ...mapActions({
            showAddressValidation: types.addressvalidation.SHOW_ADDRESS_VALIDATION
        }),

        validateAddress (event) {
            const { address, amount, label } = this

            this.showAddressValidation({
                address,
                amount,
                label
            })

            if (event.target) {
                event.target.blur()
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    .validate-address {
        @include popover-inline-button();
    }
</style>
