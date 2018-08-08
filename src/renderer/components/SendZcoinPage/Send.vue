<template>
    <section class="send-zcoin-queue-form">
        <form class="send scrollable-height" @submit.prevent="submitForm">
            <div class="grid" ref="grid">
                <div class="form">
                    <header>
                        <div>
                            <h2>
                                Send Zcoin
                            </h2>

                            <p>
                                Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Curabitur blandit tempus
                            </p>
                        </div>
                        <div v-show="hasSendQueue">
                            <base-popover
                                    :disabled="showPopover"
                                    :auto-hide="true"
                                    placement="bottom"
                                    popover-class="comet"
                                    class="pending-payments-popover"
                                    :boundaries-element="this.$refs.grid"
                                    :trigger="showSendConfirmation ? 'manually' : 'click'"
                            >
                                <template slot="target">
                                    <base-badge :visible="hasSendQueue"
                                                :count="sendQueueLength">
                                        <stack />
                                    </base-badge>
                                </template>

                                <template slot="content">
                                    <header>
                                        <h2>Pending Payments</h2>
                                        <p>Nulla vitae elit libero, a pharetra augue Integer posuere erat.</p>
                                    </header>

                                    <pending-payments :payments="pendingPayments">
                                    </pending-payments>
                                </template>
                            </base-popover>
                        </div>
                    </header>

                    <fieldset :disabled="showPopover">
                        <div class="field" :class="getFieldErrorClass('label')">
                            <label for="label">Title</label>

                            <div class="control">
                                <input v-model.trim="label"
                                       v-validate="'required'"
                                       v-tooltip="getValidationTooltip('label')"
                                       type="text"
                                       ref="label"
                                       name="label"
                                       id="label"
                                       tabindex="1">
                            </div>
                        </div>

                        <div class="field amount-field" :class="getFieldErrorClass('amount')">
                            <label for="amount">Amount</label>

                            <div class="control">
                                <input v-model.number="amount"
                                       v-validate="requiredAmountValidationRules"
                                       v-tooltip="getValidationTooltip('amount')"
                                       type="text"
                                       ref="amount"
                                       name="amount"
                                       id="amount"
                                       class="amount"
                                       tabindex="2">
                                <div class="prefix">XZC</div>
                            </div>
                        </div>

                        <div class="field" :class="getFieldErrorClass('address')">
                            <label for="address">Address</label>

                            <div class="control">
                                <input v-model.trim="address"
                                       v-validate="requiredAddressValidationRules"
                                       data-vv-validate-on="blur"
                                       v-tooltip="getValidationTooltip('address')"
                                       type="text"
                                       ref="address"
                                       name="address"
                                       id="address"
                                       tabindex="3">
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div class="button-wrap">
                    <send-confirm-dialog :can-submit="canSubmit"
                                         :is-open="showPopover"
                                         :boundaries-element="$refs.grid"
                                         :on-cancel="onCancelPayment"
                                         :on-confirm="onConfirmAndSendPayment"
                                         :on-queue-add="addToQueueAndClearFields"
                                         :queued-payments="sendQueueLength"
                                         :popover-class="getConfirmPopoverClass"
                                         tabindex="4"
                                         :contains-used-address="containsUsedAddress">
                        <div class="confirmation-popover-content-wrap">
                            <transition name="fade" mode="out-in">
                                <section v-if="showSendConfirmation" key="confirm-payment">
                                    <header>
                                        <h2>Confirm Payment</h2>
                                        <p>Nulla vitae elit libero, a pharetra augue Integer posuere erat.</p>
                                    </header>


                                    <div class="payment-fee-list">
                                        <h3>Payments</h3>
                                        <pending-payments :payments="pendingPayments"
                                                          class="pending-payments" />
                                        <fees-and-amount :amount="pendingPaymentsAmount"
                                                         :fee="fee"
                                                         :can-change-fee="true"
                                                         :on-change-fee="toggleFeeSelection">
                                            <template slot-scope="payment">
                                                {{ payment.label }}
                                                {{ payment.amount }}
                                            </template>
                                        </fees-and-amount>
                                    </div>
                                </section>
                                <section v-else-if="showFeeSelection" key="fee-selection">
                                    <send-fee-selection :selected-fee="fee.key"
                                                        @onFeeSelect="updateFee" />
                                </section>
                                <section v-else-if="showSuccess" key="success">
                                    <div class="success-icon">
                                        <send-confirmation-check />
                                    </div>
                                    <h2>Payment sucessfully sent!</h2>
                                </section>
                            </transition>
                        </div>
                    </send-confirm-dialog>
                </div>
            </div>
        </form>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { addVuexModel } from '@/utils/store'
    import types from '~/types'

    import isEmpty from 'lodash/isEmpty'
    import ValidationMixin from '@/mixins/ValidationMixin'
    import FeesAndAmount from '@/components/FeesAndAmount'
    import SendConfirmDialog from '@/components/SendZcoinPage/SendConfirmDialog'
    import SendFeeSelection from '@/components/SendZcoinPage/SendFeeSelection'
    import PendingPayments from '@/components/PendingPayments'
    import SendConfirmationCheck from '@/components/Icons/SendConfirmationCheck'
    import Stack from '@/components/Icons/Stack'

    export default {
        name: 'SendZcoin',
        components: {
            SendConfirmationCheck,
            SendFeeSelection,
            SendConfirmDialog,
            FeesAndAmount,
            PendingPayments,
            Stack
        },
        mixins: [
            ValidationMixin
        ],
        data () {
            return {
                validationFieldOrder: [
                    'label',
                    'amount',
                    'address'
                ],

                hasSent: false,
                pendingPayments: {},
                popoverStatus: '',
                popoverTimeout: null
                // showSendConfirmation: false
                // showFeeSelection: false
            }
        },

        beforeDestroy () {
            if (this.popoverTimeout) {
                clearTimeout(this.popoverTimeout)
            }
        },

        computed: {
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

            ...mapGetters({
                fee: 'ZcoinPayment/selectedFee',
                amountAsSatoshi: 'ZcoinPayment/createFormAmount',
                hasAlreadySentToAddress: 'Address/hasAlreadySentToAddress'
            }),

            hasSendQueue () {
                return !isEmpty(this.pendingPayments)
            },

            showPopover () {
                return this.popoverStatus !== ''
            },

            sendQueueLength () {
                return Object.keys(this.pendingPayments).length
            },

            pendingPaymentsAmount () {
                return Object.values(this.pendingPayments)
                    .reduce((accumulator, payment) => accumulator + (payment.cost || payment.amount), 0)
            },

            showSendConfirmation () {
                return this.popoverStatus === 'showSendConfirmation'
            },

            showFeeSelection () {
                return this.popoverStatus === 'showFeeSelection'
            },

            showSuccess () {
                return this.popoverStatus === 'showSuccess'
            },

            /*
            showQueueButton () {
                return this.hasSendQueue && !(this.showSendConfirmation && this.sendQueueLength === 1)
            },
            */

            getConfirmPopoverClass () {
                if (this.containsUsedAddress) {
                    return 'warning'
                }

                return this.showFeeSelection ? 'comet' : 'green'
            },

            containsUsedAddress () {
                if (this.hasAlreadySentToAddress(this.address)) {
                    return true
                }

                for (let address in this.pendingPayments) {
                    const usedAddress = this.hasAlreadySentToAddress(address)

                    if (usedAddress) {
                        return true
                    }
                }

                return false
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
                // todo check (spend + fees) < available balance
                return this.formValidated && !this.showFeeSelection && !this.hasSent
            }
        },

        methods: {
            toggleFeeSelection () {
                console.log('toggle fee selection')
                if (this.showFeeSelection) {
                    this.openSendConfirmation()
                } else {
                    this.openFeeSelection()
                }
            },

            updateFee (newVal) {
                console.log('update fee', newVal)
                this.$store.dispatch(types.zcoinpayment.SET_FEE, newVal)
                console.log('direct', this.fee.amount)

                // we need to defer calculation into the next tick
                // as we have to wait that the `newVal` gets synced down to components
                this.$nextTick(() => {
                    console.log('sending fee + payments to zcoind to get estimated total fee')
                    this.getTransactionFee()
                    this.toggleFeeSelection()
                })
            },

            getTransactionFee () {
                this.$store.dispatch(types.zcoinpayment.CALC_TX_FEE, {
                    payments: Object.values(this.pendingPayments),
                    fee: this.fee.amount
                })
            },

            // ---

            openSendConfirmation () {
                this.popoverStatus = 'showSendConfirmation'
            },

            openFeeSelection () {
                this.popoverStatus = 'showFeeSelection'
            },

            addToQueue () {
                this.pendingPayments = {
                    ...this.pendingPayments,
                    [this.address]: {
                        label: this.label,
                        amount: this.amountAsSatoshi,
                        amountAsBaseCoin: this.amount,
                        address: this.address,
                        confirmed: false,
                        sent: false
                    }
                }
            },

            addToQueueAndClearFields () {
                this.addToQueue()
                this.cleanupForm()
                this.cleanupPopover()
            },

            alreadyUsedAddress (address) {
                // todo move to mixin. compose this internally from different sources, use it all over the place for incoming outgoing etc.
                /*
                for (let destination in this.pendingPayments) {
                    if (address === destination && this.pendingPayments[destination].sent) {
                        return true
                    }
                }

                return false
                */
                return this.hasAlreadySentToAddress(address)
            },

            cleanupForm () {
                this.label = ''
                this.amount = null
                this.address = ''
                this.hasSent = false
                this.resetValidator()
            },

            cleanupPopover () {
                this.popoverStatus = ''
                if (this.popoverTimeout) {
                    clearTimeout(this.popoverTimeout)
                }
                // this.showSendConfirmation = false
                // this.showFeeSelection = false
            },

            removeFromQueue (address) {
                this.pendingPayments[address] = null
                delete this.pendingPayments[address]
            },

            clearQueue () {
                this.pendingPayments = {}
            },

            onCancelPayment () {
                this.cleanupPopover()
            },

            onConfirmAndSendPayment (reset) {
                this.hasSent = true
                console.log('SENDING PAYMENT!', this.pendingPayments[this.address])
                this.$store.dispatch(types.zcoinpayment.SEND_ZCOIN, {
                    payments: Object.values(this.pendingPayments),
                    fee: this.fee.amount
                })
                // this.removeFromQueue(this.address)
                this.clearQueue()

                this.popoverStatus = 'showSuccess'
                this.popoverTimeout = setTimeout(() => {
                    reset()
                    this.cleanupPopover()
                    this.cleanupForm()
                }, 5000)
            },

            submitForm () {
                console.log('submitting...')
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
                    this.addToQueue()
                    this.getTransactionFee()

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

        & > header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

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
            margin-left: emRhythm(1)
        }
    }

    .success-icon {
        max-width: emRhythm(20);
        margin: 0 auto emRhythm(2);

        & + h2 {
            margin-bottom: 0;
        }
    }

    /*.confirmation-popover {
        display: inline-block;
    }*/

    .debug {
        align-self: end;
    }
</style>