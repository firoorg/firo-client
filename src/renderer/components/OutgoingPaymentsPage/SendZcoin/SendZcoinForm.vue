<template>
    <fieldset :disabled="isDisabled">
        <div
            class="field"
            :class="getFieldErrorClass('label')"
        >
            <label for="label">
                {{ $t('send.public.detail-public-send.label__label') }}
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
                    :placeholder="$t('send.public.detail-public-send.placeholder__label')"
                    @keydown.enter.prevent
                >
            </div>
        </div>

        <div
            class="field"
            :class="getFieldErrorClass('address')"
        >
            <label for="address">
                {{ $t('send.public.detail-public-send.label__address') }}
            </label>

            <div class="control">
                <!-- Todo add validator to check if address already exists in pending items -->
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
                    :placeholder="$t('send.public.detail-public-send.placeholder__address')"
                    @keydown.enter.prevent
                >
            </div>
        </div>

        <div
            class="field amount-field"
            :class="getFieldErrorClass('amount')"
        >
            <label for="amount">
                {{ $t('send.public.detail-public-send.label__amount') }}
            </label>

            <div class="control">
                <send-private-popover
                    :is-open="showCanSpendPrivateTooltip"
                    @cancel="onCanSpendPrivateTooltipCancel"
                    @submit="onCanSpendPrivateTooltipSubmit"
                >
                    <input
                        id="amount"
                        ref="amount"
                        v-model="amount"
                        v-validate="xzcAmountValidationRules"
                        v-tooltip="getValidationTooltip('amount')"
                        data-vv-validate-on="change"
                        type="text"
                        name="amount"
                        class="amount"
                        tabindex="3"
                        :placeholder="$t('send.public.detail-public-send.placeholder__amount')"
                        @keydown.enter.prevent
                    >
                    <div class="prefix">
                        XZC
                    </div>
                </send-private-popover>
            </div>
        </div>
    </fieldset>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { addVuexModel } from '@/utils/store'
import ValidationMixin from '@/mixins/ValidationMixin'
import types from '~/types'
import SendPrivatePopover from '@/components/OutgoingPaymentsPage/SendZcoin/SendPrivatePopover'

export default {
    name: 'SendZcoinForm',
    components: {
        SendPrivatePopover
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
                'amount',
                'address'
            ],
            spendPrivateTooltipAmountSeen: null
        }
    },

    computed: {
        ...mapGetters({
            maxAmountOfMintInputsPerTx: 'ZerocoinSpend/maxAmountOfMintInputsPerTx',
            availableZerocoin: 'Balance/availableZerocoin'
        }),

        ...addVuexModel({
            name: 'label',
            getter: 'ZcoinPayment/createFormLabel',
            action: types.zcoinpayment.SET_FORM_LABEL
        }),

        ...addVuexModel({
            name: 'amount',
            getter: 'ZcoinPayment/createFormAmountAsBaseCoin',
            action: types.zcoinpayment.SET_FORM_AMOUNT
        }),

        ...addVuexModel({
            name: 'address',
            getter: 'ZcoinPayment/createFormAddress',
            action: types.zcoinpayment.SET_FORM_ADDRESS
        }),

        showCanSpendPrivateTooltip () {
            // already seen
            if (this.spendPrivateTooltipAmountSeen === this.amount) {
                return false
            }

            const amount = Number(this.amount)

            // This requires the lowest denomination of Zerocoin to be 0.1.
            return amount && amount <= this.availableZerocoin && amount % 0.1 === 0
        }
    },

    watch: {
        amount (newVal, oldVal) {
            this.spendPrivateTooltipAmountSeen = null
            this.$validator.validate()
        },
        address (newVal) {
            this.$validator.validate()
        },
        formValidated: {
            handler (newVal, oldVal) {
                this.$log.debug('form validated', newVal, oldVal)
                this.$emit('form-validated', newVal)
            },
            immediate: true
        }
    },

    methods: {
        ...mapActions({
            clearSendForm: types.zcoinpayment.CLEAR_FORM,
            clearSpendForm: types.zerocoinspend.CLEAR_FORM,
            setSpendFormLabel: types.zerocoinspend.SET_FORM_LABEL,
            setSpendFormAddress: types.zerocoinspend.SET_FORM_ADDRESS,
            setSpendFormAmount: types.zerocoinspend.SET_FORM_AMOUNT
        }),

        onCanSpendPrivateTooltipCancel () {
            this.spendPrivateTooltipAmountSeen = this.amount
        },

        onCanSpendPrivateTooltipSubmit () {
            this.spendPrivateTooltipAmountSeen = this.amount

            // populate spend form
            this.clearSpendForm()
            this.setSpendFormLabel(this.label)
            this.setSpendFormAddress(this.address)
            this.setSpendFormAmount(this.amount)

            this.$router.push({ name: 'spend-zerocoin' })

            // clear send form
            this.clearSendForm()
        }
    }
}
</script>

<style lang="scss" scoped>
    input[type="text"],
    select,
    .message {
        @include light-input();
    }

    .prefix {
        color: $color--polo-dark;
    }
</style>
