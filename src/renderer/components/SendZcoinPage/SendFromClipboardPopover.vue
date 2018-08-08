<template>
    <base-popover
            :open="isOpen"
            placement="left"
            :popover-class="[ isUsedAddress ? 'warning' : '' ]"
            :boundaries-element="boundariesElement"
            class="send-from-clipboard-popover advice"
            trigger="manually"
    >
        <template slot="target">
            <slot />
        </template>

        <template slot="content">
            <transition name="fade" mode="out-in">
                <component :is="newOrUsedAddressComponent"
                           :key="clipboardAddress"
                           :mark-as-notified="markAsNotified"
                           :set-send-form-fields="setSendFormFields" />
            </transition>
        </template>
    </base-popover>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import types from '~/types'
    import { convertToCoin } from '#/lib/convert'

    import SendFromClipboardPopoverNewAddress from '@/components/SendZcoinPage/SendFromClipboardPopoverNewAddress'
    import SendFromClipboardPopoverUsedAddress from '@/components/SendZcoinPage/SendFromClipboardPopoverUsedAddress'

    export default {
        name: 'SendFromClipboardPopover',
        components: {
            SendFromClipboardPopoverNewAddress,
            SendFromClipboardPopoverUsedAddress
        },

        props: [
            'boundariesElement'
        ],

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
            }
        }
    }
</script>

<style scoped>

</style>