<template>
    <div class="button-wrap">
        <template v-if="!currentStep">
            <spend-zerocoin-step-start-button
                :can-submit="canStart"
                :color="submitButtonColor"
                @pending-payment-added="cleanupForm"
                @next="() => onStepChange('confirm')"
            />
        </template>
        <template v-else-if="currentStep !== 'done'">
            <base-button
                v-if="currentStepCanCancel"
                color="red"
                :is-dark="true"
                :is-outline="true"
                @click.prevent="onCancel"
            >
                <span>{{ $t('send.private.flyout-confirm-private-send.button__cancel--secondary') }}</span>
            </base-button>
        </template>

        <multi-step-popover-buttons
            :steps="steps"
            :current-step="currentStep"
            :placement="currentPlacement"
            :component-props="currentComponentProps"
            :is-open="currentStepIsOpen"
            :popover-class="currentPopoverClass"
            @step-change="onStepChange"
            @can-submit="onStepCanSubmit"
            @can-cancel="onStepCanCancel"
            @is-confirmed="onConfirm"
        >
            <template
                slot="step-confirm"
                slot-scope="{ actions }"
            >
                <spend-zerocoin-step-confirm-buttons
                    :actions="actions"
                    :color="submitButtonColor"
                    :can-submit="canSubmit"
                    :is-timer-done="isConfirmed"
                />
            </template>
            <template
                slot="step-passphrase"
                slot-scope="{ actions }"
            >
                <payment-step-passphrase-buttons
                    :actions="actions"
                    :color="submitButtonColor"
                    :is-dark="true"
                    :can-submit="canSubmit"
                    :on-form-submit="onFormSubmit"
                >
                    {{ $t('send.private.flyout-confirm-private-send.button__unlock-private-send--primary') }}
                </payment-step-passphrase-buttons>
            </template>
            <template slot="step-done">
                <base-button
                    v-if="!responseIsError"
                    :color="submitButtonColor"
                    :is-dark="true"
                    :disabled="true"
                >
                    <span v-if="isLoading">
                        {{ $t('send.private.flyout-done.button__is-loading--primary') }}
                    </span>
                    <span v-else>
                        {{ $t('send.private.flyout-done.button__is-done--primary') }}
                    </span>
                </base-button>
                <base-button
                    v-else
                    color="red"
                    :is-dark="true"
                    @click.prevent="goToPassphraseStep"
                >
                    {{ $t('send.private.flyout-done.button__has-error--primary') }}
                </base-button>
            </template>
        </multi-step-popover-buttons>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GuideMixin from '@/mixins/GuideMixin'
import ConfirmPassphraseStepsMixin from '@/mixins/ConfirmPassphraseStepsMixin'

import MultiStepPopoverButtons from '@/components/Notification/MultiStepPopoverButtons'
import SpendZerocoinStepConfirm from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinStepConfirm'
import SendAddToQueueButton from '@/components/OutgoingPaymentsPage/SendZcoin/SendAddToQueueButton'
import SpendZerocoinStepStartButton from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinStepStartButton'
import SpendZerocoinStepConfirmButtons from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinStepConfirmButtons'
import PaymentStepPassphraseButtons from '@/components/payments/PaymentStepPassphraseButtons'
import Spend from "@/components/OutgoingPaymentsPage/SpendZerocoin/Spend";

export default {
    name: 'SpendZerocoinSteps',

    components: {
        MultiStepPopoverButtons,
        SendAddToQueueButton,
        SpendZerocoinStepStartButton,
        SpendZerocoinStepConfirm,
        SpendZerocoinStepConfirmButtons,
        PaymentStepPassphraseButtons
    },

    mixins: [
        GuideMixin,
        ConfirmPassphraseStepsMixin
    ],

    props: {
        label: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        amount: {
            type: Number,
            required: true
        }
    },

    data () {
        return {
            isUsedAddressCache: undefined,
            responseNamespace: 'ZerocoinSpend/spend zerocoin'
        }
    },

    computed: {
        ...mapGetters({
            isLoading: 'ZerocoinSpend/isLoading',
            hasAlreadySentToAddress: 'Address/hasAlreadySentToAddress'
        }),

        isUsedAddress () {
            if (this.isUsedAddressCache !== undefined) {
                return this.isUsedAddressCache
            }

            return this.hasAlreadySentToAddress(this.address)
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
        },

        getPassphraseStepProps() {
            return {
                translationNamespace: 'send.private.flyout-unlock-client',
                onFormSubmit: this.onFormSubmit
            }
        },

        getDoneStepProps () {
            return {
                translationNamespace: 'send.private.flyout-done'
            }
        }
    },

    mounted () {
        this.$on('step-done', () => {
            this.isUsedAddressCache = undefined
        })
    },

    beforeDestroy () {
        this.$off('step-done')
    },

    methods: {
        // override mixin
        onConfirm () {
            this.isConfirmed = true
            this.isUsedAddressCache = !!this.isUsedAddress
        },

        getConfirmStep () {
            return SpendZerocoinStepConfirm
        },

        getConfirmStepProps () {
            return {
                address: this.address,
                amount: this.amount
            }
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
