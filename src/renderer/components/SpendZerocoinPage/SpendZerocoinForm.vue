<template>
    <fieldset :disabled="isDisabled">
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
                       tabindex="1"
                       placeholder="Enter Title">
            </div>
        </div>

        <div class="field" :class="getFieldErrorClass('address')">
            <label for="address">Address</label>

            <div class="control">
                <input v-model.trim="address"
                       v-validate="requiredAddressValidationRules"
                       data-vv-validate-on="change|blur"
                       v-tooltip="getValidationTooltip('address')"
                       type="text"
                       ref="address"
                       name="address"
                       id="address"
                       tabindex="2">
            </div>
        </div>

        <div class="field amount-field" :class="getFieldErrorClass('amount')">
            <label for="amount">Amount</label>

            <div class="control">
                <base-popover :open="amountSelectorIsOpen"
                              trigger="manual"
                              placement="left-auto"
                              :offset="8*3"
                              :boundaries-element="boundariesElement">
                    <template slot="target">
                        <!-- todo validate if amount is available in balance to spend -->
                        <div tabindex="3" ref="amountSelector"
                             :class="{ 'has-focus': amountSelectorIsOpen }"
                             @focus="showAmountSelector"
                             @blur="hideAmountSelector">
                            <selected-mints-list :mints="formattedSpendFormMints"
                                                 :is-open="amountSelectorIsOpen" />
                            <!--
                            <current-mints :current-mints="formMints" />
                            -->
                        </div>
                        <!--
                        <input v-model.lazy="amount"
                               type="text"
                               ref="amount"
                               name="amount"
                               id="amount"
                               class="amount"
                               tabindex="2">
                        --->
                        <!--<div class="prefix">XZC</div>-->
                    </template>
                    <template slot="content">
                        <header class="right">
                            <h3>Select Mints</h3>
                            <p>Vestibulum id ligula porta felis euismod semper.</p>
                        </header>
                        <spend-denomination-selector class="spend-denomination-selector"
                                                     :on-denomination-change="onDenominationChange" />
                    </template>
                </base-popover>
            </div>

            <fees-and-amount class="fees-and-amount"
                             :amount="spendFormMintCostsInSatoshi"
                             :show-fee="false" />
        </div>
    </fieldset>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import types from '~/types'

    import { convertToSatoshi } from '#/lib/convert'
    import { addVuexModel } from '@/utils/store'
    import ValidationMixin from '@/mixins/ValidationMixin'
    import SpendDenominationSelector from '@/components/SpendZerocoinPage/SpendDenominationSelector'
    import FeesAndAmount from '@/components/payments/FeesAndAmount'
    import SelectedMintsList from '@/components/SpendZerocoinPage/SelectedMintsList'
    import CurrentMints from '@/components/MintZerocoinPage/CurrentMints'

    export default {
        name: 'SpendZerocoinForm',
        components: {
            SelectedMintsList,
            CurrentMints,
            FeesAndAmount,
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
            },
            boundariesElement: {
                type: HTMLElement,
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
                amountSelectorIsOpen: false,
                amountSelectorTimeout: null
            }
        },

        computed: {
            ...mapGetters({
                spendFormMints: 'ZerocoinSpend/spendFormMints'
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

            formattedSpendFormMints () {
                if (!this.spendFormMints) {
                    return []
                }

                return Object.entries(this.spendFormMints)
                // transform to [{denomination: '25', amount: 1}]
                    .map((pair) => {
                        const [ denomination, amount ] = pair

                        return {
                            denomination,
                            amount,
                            cost: parseInt(denomination) * amount
                        }
                    })
            },

            spendFormMintCosts () {
                return this.formattedSpendFormMints
                    .reduce((accumulator, current) => accumulator + current.cost, 0)
            },

            spendFormMintCostsInSatoshi () {
                return convertToSatoshi(this.spendFormMintCosts)
            }

            /*
            ...addVuexModel({
                name: 'currentMints',
                getter: 'ZerocoinSpend/spendFormMints',
                action: types.zerocoinspend.SET_FORM_MINTS
            })
            */

        },

        watch: {
            amount (newVal) {
                this.$validator.validate()
            },
            address (newVal) {
                this.$validator.validate()
            },
            formValidated: {
                handler (newVal, oldVal) {
                    console.log('form validated', newVal, oldVal)
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
                console.log('onDenominationChange', denomination)
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