<template>
    <section class="spend-zerocoin-queue-form">
        <form
            v-scrollable
            class="send scrollable-dark"
            @submit.prevent="submitForm"
        >
            <div
                ref="grid"
                class="grid"
            >
                <div class="form">
                    <header>
                        <div>
                            <h2 v-html="$t('send.private.detail-private-send.title__private-send')" />
                            <p v-html="$t('send.private.detail-private-send.description')" />
                        </div>
                    </header>

                    <fieldset>
                        <div
                            class="field"
                            :class="getFieldErrorClass('label')"
                        >
                            <label for="label">
                                {{ $t('send.private.detail-private-send.label__label') }}
                            </label>

                            <div class="control">
                                <input
                                    id="label"
                                    ref="label"
                                    v-model.trim="label"
                                    v-focus
                                    v-validate="'required'"
                                    v-tooltip="getValidationTooltip('label')"
                                    type="text"
                                    name="label"
                                    tabindex="1"
                                    :placeholder="$t('send.private.detail-private-send.placeholder__label')"
                                >
                            </div>
                        </div>

                        <div
                            class="field"
                            :class="getFieldErrorClass('address')"
                        >
                            <label for="address">
                                {{ $t('send.private.detail-private-send.label__address') }}
                                <a
                                    v-if="clipboardAddress"
                                    @click="pasteAddress"
                                >
                                    📋
                                </a>
                            </label>

                            <div class="control">
                                <input
                                    id="address"
                                    ref="address"
                                    v-model.trim="address"
                                    v-validate="requiredAddressValidationRules"
                                    v-tooltip="getValidationTooltip('address')"
                                    data-vv-validate-on="change|blur"
                                    type="text"
                                    name="address"
                                    tabindex="2"
                                    :placeholder="$t('send.private.detail-private-send.placeholder__address')"
                                >
                            </div>
                        </div>

                        <div
                            class="field amount-field"
                            :class="getFieldErrorClass('amount')"
                        >
                            <label for="amount">
                                {{ $t('send.private.detail-private-send.label__amount-selection') }}
                            </label>

                            <div class="control">
                                <!-- The decimal parameter in v-validate depends on not having Zerocoin denominations below 0.1 -->
                                <input
                                    id="amount"
                                    ref="amount"
                                    v-model.trim="amount"
                                    v-validate="zerocoinAmountValidationRules"
                                    v-tooltip="getValidationTooltip('amount')"
                                    data-vv-validate-on="change|blur"
                                    type="text"
                                    name="amount"
                                    tabindex="3"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>

                <section class="checkout has-divider">
                    <spend-zerocoin-steps
                        :on-form-submit="submitForm"
                        :form-is-valid="formSectionIsValid"
                        :cleanup-form="cleanupForm"
                        :label="label"
                        :address="address"
                        :amount="amount"
                        @steps-done="cleanupForm"
                    />
                </section>
            </div>
        </form>
    </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
// import isEmpty from 'lodash/isEmpty'
import types from '~/types'

import FeesAndAmount from '@/components/payments/FeesAndAmount'
import SpendZerocoinSteps from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendZerocoinSteps'

// import FeesAndAmount from '@/components/FeesAndAmount'
import SendConfirmDialog from '@/components/OutgoingPaymentsPage/SendZcoin/SendConfirmDialog'
import SendFeeSelection from '@/components/OutgoingPaymentsPage/SendZcoin/SendFeeSelection'
// import PendingPayments from '@/components/payments/PendingPayments'
import ValidationMixin from '@/mixins/ValidationMixin'

import SendConfirmationCheck from '@/components/Icons/SendConfirmationCheck'
import {convertToSatoshi} from "#/lib/convert";

export default {
    name: 'SpendZerocoin',
    components: {
        FeesAndAmount,
        SpendZerocoinSteps,
        SendConfirmationCheck,
        SendFeeSelection,
        SendConfirmDialog
    },

    mixins: [
        ValidationMixin
    ],

    inject: [
        '$validator'
    ],

    $_veeValidate: {
        validator: 'new' // give me my own validator instance.
    },

    data () {
        return {
            label: '',
            address: this.clipboardAddress || '',
            amount: 0,

            validationFieldOrder: [
                'label',
                'amount',
                'address'
            ],
        }
    },

    computed: {
        ...mapGetters({
            availableZerocoin: 'Balance/availableZerocoin',
            currentPassphrase: 'App/currentPassphrase',
            clipboardAddress: 'Clipboard/address'
        }),

        formSectionIsValid () {
            return this.formValidated
        }
    },

    watch: {
        label () {
            this.validate()
        },

        address () {
            this.validate()
        },

        amount () {
            this.validate()
        },

        currentStep: {
            handler (newVal, oldVal) {
                window.dispatchEvent(new Event('resize'))
            },
            immediate: true
        }
    },

    methods: {
        setFormValidationStatus (isValid) {
            this.formValidated = isValid
        },

        resetValidator () {
            this.$nextTick(() => this.$validator.reset())
        },

        cleanupForm () {
            this.label = ''
            this.amount = ''
            this.address = ''

            this.resetValidator()
        },

        submitForm () {
            if (!this.currentPassphrase) {
                this.$log.debug('no passphrase. returning')
                return
            }

            this.$store.dispatch(types.zerocoinspend.SPEND_ZEROCOIN, {
                label: this.label,
                address: this.address,
                amount: convertToSatoshi(this.amount),
                auth: this.currentPassphrase
            })
        },

        pasteAddress () {
            this.address = this.clipboardAddress
        }
    }
}
</script>

<style lang="scss" scoped>
    .spend-zerocoin-queue-form {
        height: 100vh;
        background: $color--comet-dark;

        color: $color--white;

        header {
            margin-bottom: emRhythm(7, $ms-up2);

            @include h2-with-description(inherit, $color--polo-dark);

            p {
                color: $color--white-light;
            }
        }
    }

    .send {
        padding: emRhythm(5) emRhythm(6) 0;
        height: 100vh;
        box-sizing: border-box;
    }

    .grid {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        //display: grid;
        //grid-template-rows: auto auto;
        height: 100%;
        @include bleed-h(3);
    }

    .form {
        //align-self: self-end;

        & > header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        ::selection {
            color: $color--white-light;
            background: $color--dark;
        }
    }

    .confirmation-popover-content-wrap {
        max-width: emRhythm(50);

        /deep/ .pending-payments {
            margin-bottom: emRhythm(3);
        }

        /deep/ .payment-fee-list h3 {
            @include setType(2);
            font-style: italic;
            margin: emRhythm(2) 0 emRhythm(1);
        }
    }

    fieldset {
        margin: 0;
        padding: 0;
        border: none;

        input[type="text"],
        select,
        .message {
            @include dark-input();
        }

        .prefix {
            color: $color--comet;
        }

        div[tabindex],
        div.has-focus {
            outline: none;
            cursor: pointer;
        }

        .address {
            a {
                cursor: pointer;
            }
        }
    }

    .debug {
        align-self: end;
    }

    .has-divider {
        margin-top: emRhythm(3);
        @include dark-divider-top-with-gradient();
        padding-bottom: emRhythm(5);

        .fees-and-amount {
            margin-top: 0;
            margin-bottom: emRhythm(5);
        }
    }
</style>
