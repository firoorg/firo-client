<template>
    <ul
        class="payments"
        :class="{ 'show-validate': showValidate }"
    >
        <li
            v-for="(value, key) in payments"
            :key="key"
        >
            <div class="label">
                <!--<slot v-bind="value" />-->
                {{ value.label }}
            </div>
            <div
                v-if="showValidate"
                class="validate"
            >
                <a
                    href="#"
                    class="validate-address"
                    @click.prevent="() => validateAddress(value.address)"
                >
                    Show Address
                </a>
            </div>
            <div class="amount">
                {{ value.amountAsBaseCoin }} <span class="unit">
                    xzc
                </span>
            </div>
        </li>
    </ul>
</template>

<script>
import { mapActions } from 'vuex'
import types from '~/types'

export default {
    name: 'PendingPayments',
    props: {
        showValidate: {
            type: Boolean,
            default: true
        },

        payments: {
            type: Array,
            required: true
        }
    },

    methods: {
        ...mapActions({
            showAddressValidation: types.addressvalidation.SHOW_ADDRESS_VALIDATION
        }),

        validateAddress (address) {
            this.showAddressValidation(address)
        }
    }
}
</script>

<style lang="scss" scoped>
    .payments {
        list-style: none;
        padding: 0;
        border-bottom-color: rgba($color--white, 0.5);
        border-bottom-style: solid;
        @include rhythmBorderBottom(1px, 1);
        margin: 0;

        &.show-validate li {
            grid-template-areas: "label label"
                                 "validate amount";

            .label {
                grid-area: label;
                margin-bottom: emRhythm(0.5, $silent: true);

            }

            .validate {
                grid-area: validate;

                a {
                    @include popover-inline-button();
                }
            }

            .amount {
                grid-area: amount;
            }
        }

        li {
            padding-top: emRhythm(1);
            @include rhythmBorderBottom(1px, 1);
            border-color: rgba($color--white, 0.3);
            border-bottom-style: dashed;
            @include font-medium();

            display: grid;
            grid-template-columns: auto auto;

            &:last-child {
                border: none;
                padding-bottom: emRhythm(1);
            };

            .validate-address {
            }

            .amount {
                align-self: end;
                text-align: right;

                .unit {
                    opacity: 0.55;
                }
            }
        }
    }
</style>
