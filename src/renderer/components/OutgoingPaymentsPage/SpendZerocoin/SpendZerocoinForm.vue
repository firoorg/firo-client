<template>
    <fieldset :disabled="isDisabled">
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
                <base-popover
                    :open="amountSelectorIsOpen"
                    trigger="manual"
                    placement="left-auto"
                    :offset="8*3"
                >
                    <template slot="target">
                        <!-- todo validate if amount is available in balance to spend -->
                        <div
                            ref="amountSelector"
                            tabindex="3"
                            :class="{ 'has-focus': amountSelectorIsOpen }"
                            @focus="showAmountSelector"
                            @blur="hideAmountSelector"
                        >
                            <selected-mints-list
                                :mints="spendFormMintsFormatted"
                                :is-open="amountSelectorIsOpen"
                            />
                            <input
                                id="mintCosts"
                                v-validate="{ min_value: 1 }"
                                type="hidden"
                                data-vv-validate-on="change"
                                :value="spendFormMintCosts"
                                name="mintCosts"
                            >
                        </div>
                    </template>
                    <template slot="content">
                        <div>
                            <header class="right">
                                <h3 v-html="$t('send.private.flyout-amount-selection.title__amount-selection')" />
                                <p v-html="$t('send.private.flyout-amount-selection.description__amount-selection')" />
                            </header>
                            <spend-denomination-selector
                                class="spend-denomination-selector"
                                :on-denomination-change="onDenominationChange"
                            />
                        </div>
                    </template>
                </base-popover>
            </div>
        </div>
    </fieldset>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import types from '~/types'

import { addVuexModel } from '@/utils/store'
import ValidationMixin from '@/mixins/ValidationMixin'
import SpendDenominationSelector from '@/components/OutgoingPaymentsPage/SpendZerocoin/SpendDenominationSelector'
import SelectedMintsList from '@/components/OutgoingPaymentsPage/SpendZerocoin/SelectedMintsList'

export default {
    name: 'SpendZerocoinForm',
    components: {
        SelectedMintsList,
        SpendDenominationSelector
    },

    mixins: [
        ValidationMixin
    ],

    inject: [
        '$validator'
    ],

    props: {
        isDisabled: {
            type: Boolean,
            required: true
        }
    },

    data () {
        return {
            validationFieldOrder: [
                'label',
                'address',
                'mintCosts'
            ],
            amountSelectorIsOpen: false,
            amountSelectorTimeout: null
        }
    },

    computed: {
        ...mapGetters({
            spendFormMints: 'ZerocoinSpend/spendFormMints',
            spendFormMintsFormatted: 'ZerocoinSpend/spendFormMintsFormatted',
            spendFormMintCosts: 'ZerocoinSpend/spendFormMintCosts'
        }),

        ...addVuexModel({
            name: 'label',
            getter: 'ZerocoinSpend/spendFormLabel',
            action: types.zerocoinspend.SET_FORM_LABEL
        }),

        ...addVuexModel({
            name: 'address',
            getter: 'ZerocoinSpend/spendFormAddress',
            action: types.zerocoinspend.SET_FORM_ADDRESS
        })
    },

    watch: {
        amount (newVal) {
            this.validate()
        },
        address (newVal) {
            this.validate()
        },
        spendFormMintCosts (newVal) {
            this.$log.debug('spendFormMintCosts ->', newVal)
            this.validate()
        },

        formValidated: {
            handler (newVal, oldVal) {
                // console.log('form validated', newVal, oldVal)
                this.$emit('form-validated', newVal)
            },
            immediate: true
        }
    },

    methods: {
        ...mapActions({
            setMint: types.zerocoinspend.SET_FORM_MINTS
        }),

        onDenominationChange (denomination) {
            this.$refs.amountSelector.focus()
            this.setMint(denomination)
        },

        showAmountSelector () {
            if (this.amountSelectorTimeout) {
                clearTimeout(this.amountSelectorTimeout)
            }

            this.amountSelectorIsOpen = true
        },

        hideAmountSelector () {
            this.amountSelectorTimeout = setTimeout(() => {
                this.amountSelectorIsOpen = false
            }, 100)
        }
    }
}
</script>

<style lang="scss" scoped>
    input[type="text"],
    select,
    .message {
        @include dark-input();
    }

    .prefix {
        color: $color--comet;
    }

    .has-focus {

    }

    .spend-denomination-selector {
        margin-top: emRhythm(3);
    }

    .fees-and-amount {
        margin-top: emRhythm(3);
    }

    div[tabindex],
    div.has-focus {
        outline: none;
        cursor: pointer;
    }
</style>
