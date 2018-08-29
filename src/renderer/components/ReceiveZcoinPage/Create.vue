<template>
    <transition name="slide-down" leave-active-class="slide-up-leave-active">
        <form class="create scrollable-height" @submit.prevent="submitForm">
            <div class="form">
                <h2>
                    Create<br>
                    Payment Request
                </h2>

                <div class="field" :class="getFieldErrorClass('label')">
                    <label for="label">Title</label>

                    <div class="control">
                        <input v-model.trim="label"
                               v-validate="'required'"
                               v-tooltip="getValidationTooltip('label')"
                               type="text"
                               ref="label"
                               name="label"
                               id="label">
                    </div>
                </div>

                <div class="field amount-field" :class="getFieldErrorClass('amount')">
                    <label for="amount">Amount</label>

                    <div class="control">
                        <input v-model.number="amount"
                               v-validate="amountValidationRules"
                               v-tooltip="getValidationTooltip('amount')"
                               type="text"
                               ref="amount"
                               name="amount"
                               id="amount"
                               class="amount">
                        <div class="prefix">XZC</div>
                    </div>
                </div>

                <div class="field message-field" :class="getFieldErrorClass('message')">
                    <label for="message">Message</label>
                    <div class="control">
                        <base-textarea v-model.lazy="message"
                                       ref="message"
                                       name="message"
                                       id="message"
                                       class="message" />
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
                    Create Payment Request
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
            color: $color--dark;
            background: $color--white-light;
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
