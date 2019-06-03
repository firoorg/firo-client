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
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import types from '~/types'

import { addVuexModel } from '@/utils/store'
import ValidationMixin from '@/mixins/ValidationMixin'

export default {
    name: 'SpendZerocoinForm',

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
                'amount'
            ],
            amountSelectorIsOpen: false,
            amountSelectorTimeout: null
        }
    },

    computed: {
        ...mapGetters({
            availableZerocoin: 'Balance/availableZerocoin'
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
        }),

        ...addVuexModel({
            name: 'amount',
            getter: 'ZerocoinSpend/spendFormAmount',
            action: types.zerocoinspend.SET_FORM_AMOUNT
        })
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

        formValidated: {
            handler (newVal, oldVal) {
                this.$emit('form-validated', newVal)
            },
            immediate: true
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

    div[tabindex],
    div.has-focus {
        outline: none;
        cursor: pointer;
    }
</style>
