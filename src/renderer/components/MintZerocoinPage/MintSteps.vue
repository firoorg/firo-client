<template>
    <div class="button-wrap">
        <template v-if="!currentStep">
            <mint-step-start-button
                :can-submit="canStart"
                :color="submitButtonColor"
                @next="() => onStepChange('confirm')"
            />
        </template>
        <template v-else-if="currentStep !== 'done'">
            <base-button
                v-if="currentStepCanCancel"
                color="red"
                :is-outline="true"
                @click.prevent="onCancel"
            >
                <span>{{ $t('mint.flyout-confirm-mint.button__cancel--secondary') }}</span>
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
                <mint-step-confirm-buttons
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
                >
                    {{ $t('mint.flyout-unlock-client.button__unlock-mint--primary') }}
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
                        {{ $t('mint.flyout-done.button__is-loading--primary') }}
                    </span>
                    <span v-else>
                        {{ $t('mint.flyout-done.button__is-done--primary') }}
                    </span>
                </base-button>
                <base-button
                    v-else
                    color="red"
                    :is-dark="true"
                    @click.prevent="goToPassphraseStep"
                >
                    {{ $t('mint.flyout-done.button__has-error--primary') }}
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

    components: {
        MultiStepPopoverButtons,
        MintStepStartButton,
        MintStepConfirm,
        MintStepConfirmButtons,
        PaymentStepPassphraseButtons
    },

    mixins: [
        GuideMixin,
        ConfirmPassphraseStepsMixin
    ],

    data () {
        return {
            responseNamespace: 'Mint/mint'
        }
    },

    computed: {
        ...mapGetters({
            isLoading: 'Mint/isLoading',
            currentDenominationAmount: 'Mint/currentDenominationAmount'
        }),

        getPassphraseStepProps() {
            return {
                translationNamespace: 'mint.flyout-unlock-client'
            }
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
