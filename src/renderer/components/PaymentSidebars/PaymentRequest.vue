<template>
    <section class="pr-info">
        <div class="title">
            {{ title }}
        </div>

        <div class="delete">
            <v-popover
                :open="deletePopoverIsOpen"
                placement="bottom-end"
                popover-class="tooltip popover multi-step-popover"
                trigger="manually"
                :auto-hide="false"
                :handle-resize="true"
            >
                <a
                    href="#"
                    @click.prevent="openDeletePopover"
                >
                    Delete Payment Request
                </a>

                <template slot="popover">
                    <div>
                        <div class="popover-content">
                            <base-button
                                @click.prevent="cancelDelete"
                                color="red"
                            >
                                Cancel
                            </base-button>

                            <base-button
                                @click.prevent="deletePaymentRequest"
                                color="green"
                            >
                                Confirm
                            </base-button>
                        </div>
                    </div>
                </template>
            </v-popover>
        </div>

        <div class="details">
            <div
                v-if="pr.amount"
                class="request-for-amount"
            >
                <div class="label">
                    Request for
                </div>

                <div class="amount">
                    {{ convertToCoin(pr.amount) }}
                    XZC
                </div>
            </div>

            <div class="description">
                <p>
                    <a @click.prevent="copyLink" href="#">
                        Click here
                    </a>
                    to copy a link containing payment address and amount, which can be used with a compatible Zcoin
                    client. Alternatively, copy and paste the address below, which will not include information about
                    the requested amount, but should be compatible with all exchanges and wallets.
                </p>
            </div>

            <div class="address">
                <label>Address:</label>

                <div class="value">
                    {{ pr.address }}&nbsp;<a @click.prevent="copyAddress" href="#">📋</a>
                </div>
            </div>

            <div
                v-if="pr.message"
                class="message"
            >
                <label>Message:</label>

                <div class="value">
                    {{ pr.message }}
                </div>
            </div>

            <div class="block-explorer">
                <a href="#" @click.prevent="openExplorer">
                    View Transaction in Block Explorer
                </a>
            </div>
        </div>
    </section>
</template>

<script>
import { shell, clipboard } from 'electron';
import { mapGetters } from 'vuex';
import { convertToCoin } from "#/lib/convert";

export default {
    name: "TransactionInfo",

    computed: {
        ...mapGetters({
            paymentRequests: 'PaymentRequest/paymentRequests',
            getExplorerAddressUrl: 'Settings/getExplorerAddressUrl',
            transactionsByAddress: 'Transactions/addresses'
        }),

        uniqId () {
            return this.$route.params.uniqId;
        },

        pr () {
            return this.paymentRequests[this.uniqId] || throw `unknown payment request '${this.uniqId}'`;
        },

        title () {
            return this.pr.label || 'Payment Request';
        },

        associatedTransactions () {
            return this.transactionsByAddress[this.pr.address] || [];
        }
    },

    data () {
        return {
            deletePopoverIsOpen: false
        }
    },

    watch: {
        // If this payment request receives a transaction, redirect the user there.
        associatedTransactions (newVal) {
            if (newVal.length) {
                this.$router.push(`/transaction-info/${newVal[0]}`);
            }
        }
    },

    methods: {
        convertToCoin,

        openExplorer () {
            shell.openExternal(this.getExplorerAddressUrl(this.pr.address));
        },

        copyLink () {
            const params = [];

            if (this.pr.amount) {
                params.push(`amount=${this.pr.amount}`);
            }

            if (this.pr.message || this.pr.label) {
                params.push(`message=${encodeURIComponent(this.pr.message || this.pr.label)}`);
            }

            const paramsString = params.length ? `?${params.join('&')}` : '';

            clipboard.writeText(`zcoin://${this.pr.address}${paramsString}`);
        },

        copyAddress () {
            clipboard.writeText(this.pr.address);
        },

        openDeletePopover() {
            this.deletePopoverIsOpen = true;
        },

        cancelDelete() {
            this.deletePopoverIsOpen = false;
        },

        async deletePaymentRequest() {
            const pr = this.pr;

            this.$router.push("/");

            try {
                await this.$daemon.updatePaymentRequest(pr.address, pr.amount, pr.label, pr.message, 'archived');
            } catch (e) {
                // Errors deleting a payment request should never occur during normal operation, so fancy error handling
                // isn't required.
                alert(String(e));
            }

            this.$store.dispatch('PaymentRequest/addOrUpdatePaymentRequestFromResponse', {...pr, state: 'archived'});
        }
    }
}
</script>

<style scoped lang="scss">
.pr-info {
    height: 100%;
    background: $color--comet-light;
    color: $color--comet-dark;

    padding: {
        top: 2em;
        left: 2em;
        right: 2em;
    }

    font-size: 1.5em;

    .title {
        font-size: 2em;
    }

    .delete {
        margin-top: -1em;
        text-align: right;

        a {
            font-style: italic;
            font-size: 0.6em;
        }
    }

    .description {
        padding-top: 1em;
        padding-bottom: 2em;
        font-size: 0.6em;
        font-style: italic;
        text-align: center;
    }

    .details {
        @include detail-header();

        .request-for-amount {
            text-align: right;

            .label {
                font-size: 0.8em;
                font-style: italic;
                margin-bottom: -0.5em;
            }

            .amount {
                font-size: 1.5em;
            }
        }

        .address {
            padding-top: 0.5em;
            padding-bottom: 0.5em;

            .value {
                font-family: monospace;
                font-style: italic;
                font-size: 0.9em;

                a {
                    text-decoration: none;
                }
            }
        }

        .message {
            .value {
                font-style: italic;
            }
        }

        .copy-address {
            cursor: pointer;
        }

        .block-explorer {
            font-size: 0.7em;
            font-style: italic;
            text-underline: none;
        }
    }
}

.popover-content {
    padding: 1em;

    button {
        margin: 0.5em;
    }
}
</style>
