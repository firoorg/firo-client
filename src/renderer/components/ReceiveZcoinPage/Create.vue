<template>
    <transition name="slide-down" leave-active-class="slide-up-leave-active">
        <form class="create scrollable-height" @submit.prevent="submitForm">
            <div class="form">
                <h2>
                    Create<br>
                    Payment Request
                </h2>

                <div class="field">
                    <label for="label">Title</label>

                    <div class="control">
                        <input v-model.trim="createFormLabel"
                               v-validate="'required'"
                               v-tooltip="getValidationTooltip('label')"
                               type="text"
                               ref="label"
                               name="label"
                               id="label">
                    </div>
                </div>

                <div class="field amount-field">
                    <label for="amount">Amount</label>

                    <div class="control">
                        <input v-model.number="createFormAmount"
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

                <div class="field message-field">
                    <label for="message">Message</label>
                    <div class="control">
                        <base-textarea v-model.lazy="createFormMessage"
                                       ref="message"
                                       name="message"
                                       id="message"
                                       class="message" />
                    </div>
                </div>
            </div>

            <div class="create-wrap">
                <base-button color="green"
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
                name: 'createFormLabel',
                getter: 'PaymentRequest/createFormLabel',
                action: types.paymentrequest.SET_PAYMENT_REQUEST_CREATE_FORM_LABEL
            }),
            ...addVuexModel({
                name: 'createFormAmount',
                getter: 'PaymentRequest/createFormAmount',
                action: types.paymentrequest.SET_PAYMENT_REQUEST_CREATE_FORM_AMOUNT
            }),
            ...addVuexModel({
                name: 'createFormMessage',
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
    @import '../../styles';

    .create {
        display: grid;
        grid-template-rows: auto auto;

        min-height: 100%;
        padding: emRhythm(5);
        box-sizing: border-box;

        // background: $color--polo-medium;
        background: $color--comet-dark;
        // background: $gradient--comet-horizontal;
        color: $color--white;

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
            background: rgba($color--dark, 0.4);
            color: $color--white-light;

            &:hover {
                background: rgba($color--dark, 0.55);
            }

            &:focus {
                background: rgba($color--dark, 0.7);
                color: $color--white;
            }
        }

        .prefix {
            color: $color--comet;
        }
    }

    .submit {
        width: 100%;
    }

    .create-wrap {
        align-self: self-end;
        position: relative;
        padding: emRhythm(5) emRhythm(3) 0;
    }
</style>