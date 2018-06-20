<template>
    <section class="send-zcoin-queue-form">
        <div class="fixed-button-detail-top-wrap" v-if="showQueueButton">
            <base-button color="comet">Show Queue</base-button>
        </div>
        <form class="send scrollable-height" @submit.prevent="submitForm">
            <fieldset :disabled="showSendConfirmation">
                <div class="grid" ref="grid">
                    <div class="form">
                        <header>
                            <h2>
                                Send Zcoin
                            </h2>

                            <p>
                                Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Curabitur blandit tempus
                            </p>
                        </header>

                        <div class="field">
                            <label for="label">Title</label>

                            <div class="control">
                                <input v-model.trim="label"
                                       v-validate="'required'"
                                       v-tooltip="getValidationTooltip('label')"
                                       type="text"
                                       ref="label"
                                       name="label"
                                       id="label"
                                        autofocus>
                            </div>
                        </div>

                        <div class="field amount-field">
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

                        <div class="field">
                            <label for="address">Address</label>

                            <div class="control">
                                <input v-model.trim="address"
                                       v-validate="'required'"
                                       v-tooltip="getValidationTooltip('address')"
                                       type="text"
                                       ref="address"
                                       name="address"
                                       id="address">
                            </div>
                        </div>

                        <div class="field">
                            <label for="address">Fee</label>

                            <div class="control">
                                [x] Pay only the required fee
                            </div>
                        </div>
                    </div>

                    <div class="button-wrap">
                        <base-button class="add-to-queue"
                                     ref="addToQueue"
                                     :disabled="!canSubmit">
                            Send Later
                        </base-button>

                        <base-popover
                                :open="showSendConfirmation"
                                placement="top"
                                popover-class="green"
                                class="confirmation-popover"
                                :boundariesElement="$refs.grid"
                                trigger="manually"
                        >
                            <template slot="target">
                                <base-button color="green"
                                             type="submit"
                                             class="submit"
                                             ref="submit"
                                             :disabled="!canSubmit">
                                    Send Now
                                </base-button>
                            </template>

                            <template slot="content">
                                <div class="confirmation-popover-content-wrap">
                                    <header>
                                        <h2>Confirm Payment</h2>
                                        <p>Nulla vitae elit libero, a pharetra augue Integer posuere erat.</p>
                                    </header>

                                    <fees-and-amount :fees-per-kb="0.001" :payments="pendingPayments">
                                        <template slot-scope="payment">
                                            {{ payment.label }}
                                            {{ payment.amount }}
                                        </template>
                                    </fees-and-amount>
                                </div>
                            </template>
                        </base-popover>
                    </div>
                </div>
            </fieldset>
        </form>
    </section>
</template>

<script>
    import isEmpty from 'lodash/isEmpty'
    import ValidationMixin from '@/mixins/ValidationMixin'
    import FeesAndAmount from '@/components/FeesAndAmount'

    // import { addVuexModel } from '@/utils/store'
    // import types from '~/types'

    export default {
        name: 'SendZcoin',
        components: {
            FeesAndAmount
        },
        mixins: [
            ValidationMixin
        ],
        data () {
            return {
                label: '',
                amount: null,
                address: '',
                fees: 0.001,

                validationFieldOrder: [
                    'label',
                    'amount',
                    'address'
                ],
                pendingPayments: {},
                showSendConfirmation: false
            }
        },

        computed: {
            hasSendQueue () {
                return !isEmpty(this.pendingPayments)
            },
            sendQueueLength () {
                return Object.keys(this.pendingPayments).length
            },

            showQueueButton () {
                return this.hasSendQueue && !(this.showSendConfirmation && this.sendQueueLength === 1)
            },

            isConfirmed () {
                if (!this.hasSendQueue) {
                    return false
                }

                for (let destination in this.pendingPayments) {
                    if (!this.pendingPayments[destination].confirmed) {
                        return false
                    }
                }

                return true
            },

            canSubmit () {
                return this.formValidated // todo check (spend + fees) < available balance
            }
        },

        methods: {
            openSendConfirmation () {
                this.showSendConfirmation = true
            },

            alreadyUsedAddress (address) {
                // todo move to mixin. compose this internally from different sources, use it all over the place for incoming outgoing etc.
                for (let destination in this.pendingPayments) {
                    if (address === destination) {
                        return true
                    }
                }

                return false
            },

            submitForm () {
                if (!this.canSubmit) {
                    return
                }

                // 1. check if already used -> show error
                if (this.alreadyUsedAddress(this.address)) {
                    console.log('already used! RED RED RED!')
                }

                // 2. check if confirmed -> show confirm dialog
                if (!this.isConfirmed) {
                    console.log('not confirmed yet... showing tooltip')
                    this.pendingPayments = {
                        ...this.pendingPayments,
                        [this.address]: {
                            label: this.label,
                            amount: this.amount,
                            address: this.address,
                            confirmed: false
                        }
                    }

                    this.openSendConfirmation()
                    return
                }

                console.log('trigger send')
            }
        }
    }
</script>

<style lang="scss" scoped>
    .send-zcoin-queue-form {
        height: 100vh;

        header {
            // margin-left: emRhythm(3, $ms-up2);
            margin-bottom: emRhythm(7);

            @include h2-with-description(inherit, $color--polo-dark);
        }
    }

    .send {
        padding: emRhythm(5) emRhythm(6);
        height: 100vh;
        box-sizing: border-box;
    }

    .grid {
        display: grid;
        grid-template-rows: auto auto;
        height: 100%;
        @include bleed-h(3);
    }

    .form {
        //align-self: self-end;

        ::selection {
            color: $color--white-light;
            background: $color--dark;
        }

        input[type="text"],
        select,
        .message {
            background: $color--polo-light;
            color: $color--dark-light;

            &:hover {
                background: rgba($color--polo-medium, 0.55);
            }

            &:focus {
                background: rgba($color--polo-medium, 0.7);
                color: $color--dark;
            }
        }

        .prefix {
            color: $color--polo-dark;
        }
    }

    .confirmation-popover-content-wrap {
        max-width: emRhythm(40);
    }

    fieldset {
        margin: 0;
        padding: 0;
        height: 100%;
        border: none;

        &[disabled] {
            input[type="text"],
            select,
            .message {
                pointer-events: none;
            }
        }
    }

    .button-wrap {
        align-self: self-end;
        text-align: center;

        button + button,
        button + .confirmation-popover {
            margin-left: emRhythm(3)
        }
    }

    .confirmation-popover {
        display: inline-block;
    }
</style>