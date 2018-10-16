<template>
    <transition name="slide-down" leave-active-class="slide-up-leave-active">
        <form class="create scrollable-height" @submit.prevent="submitForm">
            <div class="form">
                <h2 v-html="$t('receive.detail-create-request.title__create')"></h2>

                <div class="field" :class="getFieldErrorClass('label')">
                    <label for="label">
                      {{ $t('receive.detail-create-request.label__label') }}
                    </label>

                    <div class="control">
                        <input v-model.trim="label"
                               v-validate="'required'"
                               v-tooltip="getValidationTooltip('label')"
                               type="text"
                               ref="label"
                               name="label"
                               id="label"
                               :placeholder="$t('receive.detail-create-request.placeholder__label')" >
                    </div>
                </div>

                <div class="field amount-field" :class="getFieldErrorClass('amount')">
                    <label for="amount">
                      {{ $t('receive.detail-create-request.label__amount') }}
                    </label>

                    <div class="control">
                        <input v-model.lazy.number="amount"
                               v-validate="amountValidationRules"
                               v-tooltip="getValidationTooltip('amount')"
                               type="text"
                               ref="amount"
                               name="amount"
                               id="amount"
                               class="amount"
                               :placeholder="$t('receive.detail-create-request.placeholder__amount')" >
                        <div class="prefix">XZC</div>
                    </div>
                </div>

                <div class="field message-field" :class="getFieldErrorClass('message')">
                    <label for="message">
                      {{ $t('receive.detail-create-request.label__message') }}
                    </label>
                    <div class="control">
                        <base-textarea v-model.lazy="message"
                                       ref="message"
                                       name="message"
                                       id="message"
                                       class="message"
                                       :placeholder="$t('receive.detail-create-request.placeholder__message')" />
                    </div>
                </div>
            </div>

            <div class="create-wrap">
                <base-button color="green"
                             :is-dark="false"
                             type="submit"
                             class="submit"
                             ref="submit"
                             :disabled="!canSubmit">
                  {{ $t('receive.detail-create-request.button__create-payment-request') }}
                </base-button>
            </div>
        </form>
    </transition>
</template>

<script>
    import ValidationMixin from '@/mixins/ValidationMixin'
    import { mapGetters } from 'vuex'
    import { addVuexModel } from '@/utils/store'
    import types from '~/types'

    export default {
        name: 'createPaymentRequest',
        mixins: [
            ValidationMixin
        ],
        $_veeValidate: {
            validator: 'new' // give me my own validator instance.
        },

        data () {
            return {
                buttonStep: 0,
                validationFieldOrder: [
                    'label',
                    'amount',
                    'message'
                ]
            }
        },

        computed: {
            ...addVuexModel({
                name: 'label',
                getter: 'PaymentRequest/createFormLabel',
                action: types.paymentrequest.SET_PAYMENT_REQUEST_CREATE_FORM_LABEL
            }),
            ...addVuexModel({
                name: 'amount',
                getter: 'PaymentRequest/createFormAmountAsBaseCoin',
                action: types.paymentrequest.SET_PAYMENT_REQUEST_CREATE_FORM_AMOUNT
            }),
            ...addVuexModel({
                name: 'message',
                getter: 'PaymentRequest/createFormMessage',
                action: types.paymentrequest.SET_PAYMENT_REQUEST_CREATE_FORM_MESSAGE
            }),

            ...mapGetters({
                isLoading: 'PaymentRequest/isLoading'
            }),

            canSubmit () {
                return this.formValidated && !this.isLoading
            }
        },

        methods: {
            submitForm () {
                if (!this.canSubmit) {
                    return
                }

                this.$store.dispatch(types.paymentrequest.CREATE_PAYMENT_REQUEST)
                console.log('submitting form')
                this.$refs.submit.$el.blur()
                this.resetValidator()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .create {
        display: grid;
        grid-template-rows: auto auto;

        min-height: 100%;
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
            color: $color--polo-dark;
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
