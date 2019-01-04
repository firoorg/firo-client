<template>
    <div class="outgoing">
        <header class="outgoing-header">
            <div class="inner">
                <span>{{ $d(new Date(firstSeenAt), 'long') }}</span>
                <editable-label
                    :label="labelOrPlaceholder"
                    @submit="onLabelUpdate"
                >
                    <natural-language-tags
                        :content="labelOrPlaceholder"
                        tag-size="large"
                        :on-tag-click="tagClicked"
                    />
                </editable-label>
                <span v-if="isPrivate">
                    {{ amountInBaseCoin }} XZC {{ $t('send.detail-entry-transaction.label__spend') }}
                </span>
                <span v-else>
                    {{ amountInBaseCoin }} XZC {{ $t('send.detail-entry-transaction.label__send') }}
                </span>
            </div>
            <div class="status outgoing-icon">
                <payment-status :is-confirmed="isConfirmed" />
            </div>
        </header>

        <div>
            <h3
                class="tx-headline"
                v-html="$t('send.detail-entry-transaction.title__transaction')"
            />
            <transactions-list :transactions="[getOutgoingTransactionById(id)]" />
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
import { mapGetters, mapActions } from 'vuex'

import types from '~/types'

import { convertToCoin } from '#/lib/convert'

import NaturalLanguageTags from '@/components/Tag/NaturalLanguageTags'
import PaymentStatus from '@/components/Icons/PaymentStatus'
import TransactionsList from '@/components/payments/TransactionsList'
import EditableLabel from '@/components/./payments/Detail/EditableLabel'

export default {
    name: 'OutgoingPaymentDetail',
    components: {
        EditableLabel,
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
        belongsToAddress: {
            type: String,
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
        category: {
            type: String,
            required: true
        },
        label: {
            type: String,
            default: ''
        }
    },

    computed: {
        ...mapGetters({
            isTestnet: 'Blockchain/isTestnet',
            getOutgoingTransactionById: 'Address/getOutgoingTransactionById'
        }),

        amountInBaseCoin () {
            return convertToCoin(this.amount)
        },

        labelOrPlaceholder () {
            const label = this.label || this.$t('send.table__outgoing-payments.label__tx-nolabel')

            if (this.category === 'send') {
                return `${label} #${this.$t('send.table__outgoing-payments.label__tx-category-send')}`
            } else if (this.category === 'spendOut') {
                return `${label} #${this.$t('send.table__outgoing-payments.label__tx-category-spendOut')}`
            }

            return label
        }
    },
    methods: {
        ...mapActions({
            updateLabel: types.address.UPDATE_TX_LABEL,
        }),

        onLabelUpdate({ label }) {
            this.updateLabel({
                label,
                id: this.id
            })
        },

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
