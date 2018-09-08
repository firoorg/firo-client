<template>
    <div class="is-fulfilled">
        <h2 class="payments-headline">Payments
            <span v-if="transactions.length > 1">({{ transactions.length }})</span>
        </h2>
        <div style="overflow: hidden" class="testing">
            <div :style="{ height: '100%' }">
                <unexpected-transaction-popover :is-reused="isReused" :boundaries-element="null">
                    <transactions-list :transactions="transactions" class="scrollable-container" />
                </unexpected-transaction-popover>
            </div>

            <div class="message-wrap">
                <h2>Message</h2>
                <div v-html="messageFormatted" />
            </div>
        </div>

        <div class="actions">
            <base-button @click.prevent="openBlockExplorer">
                {{ $t('receive.detail-entry-request.fulfilled.button__open-explorer') }}
            </base-button>
        </div>
    </div>
</template>

<script>
    import { nl2br } from '@/utils/format'

    import UnexpectedTransactionPopover from '@/components/ReceiveZcoinPage/UnexpectedTransactionPopover'
    import TransactionsList from '@/components/ReceiveZcoinPage/TransactionsList'

    export default {
        name: 'ReceiveFulfilledPaymentRequest',

        components: {
            UnexpectedTransactionPopover,
            TransactionsList
        },

        props: {
            transactions: {
                type: Array,
                required: true
            },
            isReused: {
                type: Boolean,
                required: true
            },
            address: {
                type: Object,
                required: true
            },
            message: {
                type: String,
                default: null
            }
        },

        computed: {
            messageFormatted () {
                return nl2br(this.message)
            }
        },

        methods: {
            openBlockExplorer (event) {
                event.preventDefault()

                // todo get blockchain explorer settings and open browser via electron shell
                alert(`opening ${this.address.address} in block explorer`)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .testing {
        overflow: hidden;
    }

    .is-fulfilled {
        display: grid;
        grid-template-rows: auto 1fr auto;
        overflow: hidden;

        h2 {
            @include font-black();
            @include setType(2, $ms-up1);
        }

        .payments-headline {
            margin-left: emRhythm(3, $ms-up1);
        }

        .message-wrap {
            margin-left: emRhythm(3);
        }

        .unexpected-transaction-popover {
            height: 100%;

            & /deep/ .trigger {
                width: 100%;
                height: 100%;
            }
        }

        /*.message-wrap {
            @include divider-top-with-gradient();
            margin: 0 emRhythm(3);
        }*/

        .actions {
            @include divider-top-with-gradient();
            padding-bottom: 0;
            display: flex;
            justify-content: center;

            button + button,
            .popover + button {
                margin-left: emRhythm(2);
            }
        }
    }
</style>
