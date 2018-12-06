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
                :set-send-form-fields="setSendFormFields"
            />
        </template>
    </base-popover>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import types from '~/types'
import { convertToCoin } from '#/lib/convert'

import SendFromClipboardPopoverNewAddress from '@/components/OutgoingPaymentsPage/SendZcoin/SendFromClipboardPopoverNewAddress'
import SendFromClipboardPopoverUsedAddress from '@/components/OutgoingPaymentsPage/SendZcoin/SendFromClipboardPopoverUsedAddress'

export default {
    name: 'SendFromClipboardPopover',
    components: {
        SendFromClipboardPopoverNewAddress,
        SendFromClipboardPopoverUsedAddress
    },

    computed: {
        ...mapGetters({
            clipboardHasNewAddress: 'Clipboard/hasNewAddress',
            clipboardAddress: 'Clipboard/address',
            clipboardAmount: 'Clipboard/amount',
            currentFormAddress: 'ZcoinPayment/createFormAddress',
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

            return `SendFromClipboardPopover${newOrUsed}Address`
        }
    },

    methods: {
        ...mapActions({
            setFormAddress: types.zcoinpayment.SET_FORM_ADDRESS,
            setFormAmount: types.zcoinpayment.SET_FORM_AMOUNT,
            markAsNotified: types.clipboard.MARK_AS_NOTIFIED
        }),

        setSendFormFields () {
            if (!this.clipboardAddress) {
                return
            }

            this.setFormAddress(this.clipboardAddress)

            if (this.clipboardAmount) {
                this.setFormAmount(convertToCoin(this.clipboardAmount))
            }

            this.markAsNotified()

            this.$emit('update-form', {
                name: 'send-zcoin'
            })
        }
    }
}
</script>

<style scoped>

</style>
