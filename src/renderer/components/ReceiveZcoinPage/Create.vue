<template>
    <transition
        name="slide-down"
        leave-active-class="slide-up-leave-active"
    >
        <form
            v-scrollable
            class="create scrollable-medium"
        >
            <div class="form">
                <h2 v-html="$t('receive.detail-create-request.title__create')" />

                <div class="field">
                    <label for="label">
                        {{ $t('receive.detail-create-request.label__label') }}
                    </label>

                    <div class="control">
                        <input
                            id="label"
                            v-model.trim="label"
                            type="text"
                            name="label"
                            :placeholder="$t('receive.detail-create-request.placeholder__label')"
                        />
                    </div>
                </div>

                <div class="field amount-field">
                    <label for="amount">
                        {{ $t('receive.detail-create-request.label__amount') }}
                    </label>

                    <div class="control">
                        <input
                            id="amount"
                            v-model="amount"
                            v-validate="'paymentRequestAmountIsValid'"
                            v-tooltip="getValidationTooltip('amount')"
                            type="text"
                            name="amount"
                            class="amount"
                            :placeholder="$t('receive.detail-create-request.placeholder__amount')"
                        />
                        <div class="prefix">
                            XZC
                        </div>
                    </div>
                </div>

                <div class="field message-field">
                    <label for="message">
                        {{ $t('receive.detail-create-request.label__message') }}
                    </label>
                    <div class="control">
                        <base-textarea
                            id="message"
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
                    color="green"
                    type="submit"
                    class="submit"
                    :disabled="!canCreateRequest"
                    @click.prevent="createRequest"
                >
                    {{ $t('receive.detail-create-request.button__create-payment-request') }}
                </base-button>
            </div>
        </form>
    </transition>
</template>

<script>
import {convertToSatoshi} from "#/lib/convert";

export default {
    name: 'CreatePaymentRequest',

    inject: [
        '$validator'
    ],

    data () {
        return {
            label: '',
            amount: '',
            message: ''
        }
    },

    computed: {
        canCreateRequest () {
            return !this.validationErrors.items.length
        },

        getValidationTooltip () {
            return (fieldName) => ({
                content: this.validationErrors.first(fieldName),
                trigger: 'manual',
                boundariesElement: 'body',
                offset: 8,
                placement: 'left',
                classes: 'error',
                show: true
            })
        }
    },

    mounted () {
        this.$validator.extend('paymentRequestAmountIsValid', {
            getMessage: () => 'Amount Must Be A Multiple of 0.00000001',
            // We use a regex here so as to not to have to deal with floating point issues.
            validate: (value) => !!value.match(/^\d+(\.\d{1,8})?$/)
        });
    },

    methods: {
        async createRequest () {
            if (!this.canCreateRequest) {
                return
            }

            const label = this.label || (this.amount ? `Request for ${this.amount} XZC` : 'Payment Request');
            const pr = await this.$daemon.createPaymentRequest(convertToSatoshi(this.amount), label, this.message);
            this.$store.dispatch('PaymentRequest/addOrUpdatePaymentRequestFromResponse', pr);

            this.label = '';
            this.amount = '';
            this.message = '';
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
