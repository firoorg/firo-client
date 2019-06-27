<template>
    <transition
        name="slide-down"
        leave-active-class="slide-up-leave-active"
    >
        <form
            v-scrollable
            class="create scrollable-medium"
            @submit.prevent="submitForm"
        >
            <div class="form">
                <h2 v-html="$t('receive.detail-create-request.title__create')" />

                <div
                    class="field"
                    :class="getFieldErrorClass('label')"
                >
                    <label for="label">
                        {{ $t('receive.detail-create-request.label__label') }}
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
                            :placeholder="$t('receive.detail-create-request.placeholder__label')"
                        >
                    </div>
                </div>

                <div
                    class="field amount-field"
                    :class="getFieldErrorClass('amount')"
                >
                    <label for="amount">
                        {{ $t('receive.detail-create-request.label__amount') }}
                    </label>

                    <div class="control">
                        <input
                            id="amount"
                            ref="amount"
                            v-model.number="amount"
                            v-validate="amountValidationRules"
                            v-tooltip="getValidationTooltip('amount')"
                            type="text"
                            name="amount"
                            class="amount"
                            :placeholder="$t('receive.detail-create-request.placeholder__amount')"
                        >
                        <div class="prefix">
                            XZC
                        </div>
                    </div>
                </div>

                <div
                    class="field message-field"
                    :class="getFieldErrorClass('message')"
                >
                    <label for="message">
                        {{ $t('receive.detail-create-request.label__message') }}
                    </label>
                    <div class="control">
                        <base-textarea
                            id="message"
                            ref="message"
                            v-model="message"
                            name="message"
                            class="message"
                            :placeholder="$t('receive.detail-create-request.placeholder__message')"
                        />
                    </div>
                </div>
            </div>

            <div class="create-wrap">
                <base-button
                    ref="submit"
                    color="green"
                    :is-dark="false"
                    type="submit"
                    class="submit"
                    :disabled="!canSubmit"
                >
                    {{ $t('receive.detail-create-request.button__create-payment-request') }}
                </base-button>
            </div>
        </form>
    </transition>
</template>

<script>
import ValidationMixin from '@/mixins/ValidationMixin'
import types from '~/types'

export default {
    name: 'CreatePaymentRequest',
    mixins: [
        ValidationMixin
    ],
    $_veeValidate: {
        validator: 'new' // give me my own validator instance.
    },

    data () {
        return {
            label: '',
            amount: '',
            message: '',

            validationFieldOrder: [
                'label',
                'amount',
                'message'
            ]
        }
    },

    methods: {
        submitForm () {
            if (!this.canSubmit) {
                return
            }

            this.$store.commit(types.paymentrequest.CREATE_PAYMENT_REQUEST, {
                label: this.label,
                amount: this.amount * 1e8,
                message: this.message
            })

            this.label = ''
            this.amount = ''
            this.message = ''
            this.resetValidator()
        }
    }
}
</script>

<style lang="scss" scoped>
    .create {
        display: grid;
        grid-template-rows: auto auto;

        height: 100vh;
        padding: emRhythm(5) emRhythm(6);
        box-sizing: border-box;

        background: $color--polo-medium;
        // background: $color--comet-dark;
        // background: $gradient--comet-horizontal;
        // color: $color--white;

        h2 {
            margin-left: emRhythm(3, $ms-up2);
            margin-bottom: emRhythm(7, $ms-up2);
        }
    }

    .form {
        ::selection {
            color: $color--white;
            background: $color--comet-dark-mixed;
        }

        input[type="text"],
        select,
        .message {
            @include medium-input();
        }

        .prefix {
            @include light-prefix();
        }
    }

    .submit {
        width: 100%;
    }

    .create-wrap {
        align-self: self-end;
        position: relative;
        padding: emRhythm(5) emRhythm(4) 0;
    }
</style>
