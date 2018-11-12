<template>
    <div class="button-wrap">
        <template v-if="!currentStep">
            <mint-step-start-button :can-submit="canStart"
                                    :color="submitButtonColor"
                                    @next="() => onStepChange('confirm')" />
        </template>
        <template v-else-if="currentStep !== 'done'">
            <base-button v-if="currentStepCanCancel"
                         color="red"
                         :is-outline="true"
                         @click.prevent="onCancel">
                <span>{{ $t('mint.flyout-confirm-mint.button__cancel--secondary') }}</span>
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
                                    :popover-class="currentPopoverClass">
            <template slot="step-confirm" slot-scope="{ actions }">
                <mint-step-confirm-buttons :actions="actions"
                                           :color="submitButtonColor"
                                           :can-submit="canSubmit"
                                           :is-timer-done="isConfirmed">
                </mint-step-confirm-buttons>
            </template>
            <template slot="step-passphrase" slot-scope="{ actions }">
                <payment-step-passphrase-buttons :actions="actions"
                                                 :color="submitButtonColor"
                                                 :is-dark="true"
                                                 :can-submit="canSubmit">
                    {{ $t('mint.flyout-unlock-client.button__unlock-mint--primary') }}
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

    import MultiStepPopoverButtons from '@/components/Notification/MultiStepPopoverButtons'

    import MintStepStartButton from '@/components/MintZerocoinPage/MintStepStartButton'
    import MintStepConfirm from '@/components/MintZerocoinPage/MintStepConfirm'
    import MintStepConfirmButtons from '@/components/MintZerocoinPage/MintStepConfirmButtons'
    import PaymentStepPassphraseButtons from '@/components/payments/PaymentStepPassphraseButtons'

    export default {
        name: 'MintSteps',

        mixins: [
            GuideMixin,
            ConfirmPassphraseStepsMixin
        ],

        components: {
            MultiStepPopoverButtons,
            MintStepStartButton,
            MintStepConfirm,
            MintStepConfirmButtons,
            PaymentStepPassphraseButtons
        },

        computed: {
            ...mapGetters({
                isLoading: 'Mint/isLoading',
                responseIsValid: 'Mint/mintResponseIsValid',
                responseIsError: 'Mint/mintResponseIsError',
                responseError: 'Mint/mintResponseError',
                currentDenominationAmount: 'Mint/currentDenominationAmount'
            }),

            submitButtonColor () {
                return 'green'
            },

            getDoneStepProps () {
                return {
                    successIconComponentName: 'MintStarted',
                    translationNamespace: 'mint.flyout-done',
                    translationMode: 'plural',
                    translationPluralCount: this.currentDenominationAmount
                }
            }
        },

        methods: {
            getConfirmStep () {
                return MintStepConfirm
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
