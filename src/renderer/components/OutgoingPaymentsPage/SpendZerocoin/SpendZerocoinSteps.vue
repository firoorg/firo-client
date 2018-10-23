<template>
    <div class="button-wrap">
        <template v-if="!currentStep">
            <spend-zerocoin-step-start-button :can-submit="canStart"
                                    :color="submitButtonColor"
                                    @pending-payment-added="cleanupForm"
                                    @next="() => onStepChange('confirm')" />
        </template>
        <template v-else-if="currentStep !== 'done'">
            <base-button v-if="currentStepCanCancel"
                         color="red"
                         :is-dark="true"
                         :is-outline="true"
                         @click.prevent="onCancel">
                <span>{{ $t('send.private.flyout-confirm-private-send.button__cancel--secondary') }}</span>
            </base-button>
        </template>

        <multi-step-popover-buttons :steps="steps"
                                    :current-step="currentStep"
                                    @step-change="onStepChange"
                                    @can-submit="onStepCanSubmit"
                                    @can-cancel="onStepCanCancel"
                                    @is-confirmed="onConfirm"
                                    :placement="currentPlacement"
                                    :component-props="currentComponentProps"
                                    :is-open="currentStepIsOpen"
                                    :boundaries-element="boundariesElement"
                                    :popover-class="currentPopoverClass">
            <template slot="step-confirm" slot-scope="{ actions }">
                <spend-zerocoin-step-confirm-buttons :actions="actions"
                                           :color="submitButtonColor"
                                           :can-submit="canSubmit"
                                           :is-timer-done="isConfirmed">
                </spend-zerocoin-step-confirm-buttons>
            </template>
            <template slot="step-passphrase" slot-scope="{ actions }">
                <payment-step-passphrase-buttons :actions="actions"
                                              :color="submitButtonColor"
                                              :is-dark="true"
                                              :can-submit="canSubmit">
                    {{ $t('send.private.flyout-confirm-private-send.button__unlock-private-send--primary') }}
                </payment-step-passphrase-buttons>
            </template>
            <template slot="step-done" slot-scope="{ actions }">
                <base-button :color="submitButtonColor" :is-dark="true" :disabled="true">
                    <span v-if="isLoading">Sending...</span>
                    <span v-else>Sent!</span>
                </base-button>
            </template>
        </multi-step-popover-buttons>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import GuideMixin from '@/mixins/GuideMixin'
    import ConfirmPassphraseStepsMixin from '@/mixins/ConfirmPassphraseStepsMixin'
    import types from '~/types'

    import MultiStepPopoverButtons from '@/components/Notification/MultiStepPopoverButtons'
    import SpendZerocoinStepConfirm from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinStepConfirm'
    import SendAddToQueueButton from '@/components/OutgoingPaymentsPage/SendZcoin/SendAddToQueueButton'
    import SpendZerocoinStepStartButton from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinStepStartButton'
    import SpendZerocoinStepConfirmButtons from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinStepConfirmButtons'
    import PaymentStepPassphraseButtons from '@/components/payments/PaymentStepPassphraseButtons'

    export default {
        name: 'SpendZerocoinSteps',

        mixins: [
            GuideMixin,
            ConfirmPassphraseStepsMixin
        ],

        components: {
            MultiStepPopoverButtons,
            SendAddToQueueButton,
            SpendZerocoinStepStartButton,
            SpendZerocoinStepConfirm,
            SpendZerocoinStepConfirmButtons,
            PaymentStepPassphraseButtons
        },

        data () {
            return {
                onCancelActionName: types.zerocoinspend.CLEAR_SPEND_ZEROCOIN_RESPONSE,
                responseNamespace: 'ZerocoinSpend/spendZerocoin'
            }
        },

        computed: {
            ...mapGetters({
                isLoading: 'ZerocoinSpend/isLoading',
                responseIsValid: 'ZerocoinSpend/spendZerocoinResponseIsValid',
                responseIsError: 'ZerocoinSpend/spendZerocoinResponseIsError',
                responseError: 'ZerocoinSpend/spendZerocoinResponseError',
                currentFormAddress: 'ZerocoinSpend/spendFormAddress',
                hasAlreadySentToAddress: 'Address/hasAlreadySentToAddress'
            }),

            isUsedAddress () {
                return this.hasAlreadySentToAddress(this.currentFormAddress)
            },

            // mixin override
            submitButtonColor () {
                if (this.isUsedAddress) {
                    return 'orange'
                }

                if (this.responseIsError) {
                    return 'red'
                }

                return 'green'
            }
        },

        methods: {
            getConfirmStep () {
                return SpendZerocoinStepConfirm
            }
        }
    }
</script>

<style lang="scss" scoped>
    .button-wrap {
        align-self: self-end;
        text-align: center;

        .v-popover {
            display: inline-block;
        }

        button + button,
        button + .v-popover {
            margin-left: emRhythm(1)
        }
    }
</style>
