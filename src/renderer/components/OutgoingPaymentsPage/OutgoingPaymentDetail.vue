<template>
        <div class="outgoing">
            <header class="outgoing-header">
                <div class="inner">
                    <span>{{ $d(new Date(firstSeenAt), 'long') }}</span>
                    <h2>
                        <natural-language-tags :content="label"
                                               tag-size="large"
                                               :on-tag-click="tagClicked" />
                    </h2>
                    <span v-if="isPrivate">{{ amountInBaseCoin }} XZC {{ $t('send.detail-entry-transaction.label__spend') }}</span>
                    <span v-else>{{ amountInBaseCoin }} XZC {{ $t('send.detail-entry-transaction.label__send') }}</span>
                </div>
                <div class="status outgoing-icon">
                    <payment-status :is-confirmed="isConfirmed" />
                </div>
            </header>

            <div>
                <h3 class="tx-headline" v-html="$t('send.detail-entry-transaction.title__transaction')"></h3>
                <transactions-list :transactions="transaction" />
            </div>

            <div class="actions">
                <base-button @click.prevent="openBlockExplorer">
                    {{ $t('send.detail-entry-transaction.button__open-explorer--primary') }}
                </base-button>
            </div>
        </div>
</template>

<script>
    import { shell } from 'electron'
    import { mapGetters } from 'vuex'

    import { convertToCoin } from '#/lib/convert'

    import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'
    import PaymentStatus from '@/components/Icons/PaymentStatus'
    import TransactionsList from '@/components/payments/TransactionsList'

    export default {
        name: 'outgoingPaymentDetail',
        components: {

            PaymentStatus,
            NaturalLanguageTags,
            TransactionsList
            // 'qr-code': VueQRCodeComponent,
        },
        props: {
            id: {
                type: String,
                required: true
            },
            txid: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            firstSeenAt: {
                type: Number,
                required: true
            },
            isConfirmed: {
                type: Boolean,
                required: true
            },
            isPrivate: {
                type: Boolean,
                default: false
            },
            /*
            category: {
                type: String,
                required: true
            },
            */
            label: {
                type: String,
                required: true
            }
        },

        computed: {
            ...mapGetters({
                isTestnet: 'Blockchain/isTestnet',
                transactions: 'Address/getOutgoingTransactions'
            }),

            amountInBaseCoin () {
                return convertToCoin(this.amount)
            },

            transaction () {
                return this.transactions.filter((tx) => {
                    const { id } = tx

                    return id === this.id
                })
            }
        },
        methods: {
            tagClicked (tag) {
                this.$router.push({
                    name: this.$router.currentRoute.name || 'send-zcoin',
                    query: {
                        filter: `#${tag}`
                    }
                })
            },

            openBlockExplorer (event) {
                event.preventDefault()

                const explorerUrl = this.isTestnet ? 'https://testexplorer.zcoin.io/tx/' : 'https://explorer.zcoin.io/tx/'

                shell.openExternal(`${explorerUrl}${this.txid}`)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .outgoing {
        @include detail-wrap();
        padding-top: emRhythm(5);
    }

    .outgoing-header {
        @include detail-header();
    }

    .tx-headline {
        margin-left: emRhythm(3, $ms-up1);
    }

    .actions {
        @include detail-actions();
    }
</style>
