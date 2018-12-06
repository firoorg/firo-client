<template>
    <base-popover
        :open="isOpen"
        placement="left-start"
        :popover-class="[ isUsedAddress ? 'warning advice' : 'advice' ]"
        class="send-from-clipboard-popover"
        trigger="manually"
    >
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <component
                :is="newOrUsedAddressComponent"
                :key="clipboardAddress"
                :mark-as-notified="markAsNotified"
                :set-send-form-fields="setSpendFormFields"
            />
        </template>
    </base-popover>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import types from '~/types'
// import { convertToCoin } from '#/lib/convert'

import SpendZerocoinFromClipboardPopoverNewAddress from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinFromClipboardPopoverNewAddress'
import SpendZerocoinFromClipboardPopoverUsedAddress from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinFromClipboardPopoverUsedAddress'

export default {
    name: 'SpendZerocoinFromClipboardPopover',
    components: {
        SpendZerocoinFromClipboardPopoverNewAddress,
        SpendZerocoinFromClipboardPopoverUsedAddress
    },

    computed: {
        ...mapGetters({
            clipboardHasNewAddress: 'Clipboard/hasNewAddress',
            clipboardAddress: 'Clipboard/address',
            clipboardAmount: 'Clipboard/amount',
            currentFormAddress: 'ZerocoinSpend/spendFormAddress',
            hasAlreadySentToAddress: 'Address/hasAlreadySentToAddress'
        }),

        isOpen () {
            return this.clipboardHasNewAddress &&
                       this.clipboardAddress !== this.currentFormAddress
        },

        isUsedAddress () {
            return this.hasAlreadySentToAddress(this.clipboardAddress)
        },

        newOrUsedAddressComponent () {
            const newOrUsed = this.isUsedAddress ? 'Used' : 'New'

            // todo add case to match "send to yourself"

            return `SpendZerocoinFromClipboardPopover${newOrUsed}Address`
        }
    },

    methods: {
        ...mapActions({
            setFormAddress: types.zerocoinspend.SET_FORM_ADDRESS,
            // setFormAmount: types.zerocoinspend.SET_FORM_AMOUNT,
            markAsNotified: types.clipboard.MARK_AS_NOTIFIED
        }),

        setSpendFormFields () {
            if (!this.clipboardAddress) {
                return
            }

            this.setFormAddress(this.clipboardAddress)

            /*
                if (this.clipboardAmount) {
                    this.setFormAmount(convertToCoin(this.clipboardAmount))
                }
                */

            this.markAsNotified()

            this.$emit('update-form', {
                name: 'spend-zerocoin'
            })
        }
    }
}
</script>

<style scoped>

</style>
