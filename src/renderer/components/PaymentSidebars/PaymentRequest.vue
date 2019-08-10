<template>
    <section class="pr-info">
        <div class="title">
            {{ title }}
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
                    {{ pr.address }}
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
            getExplorerAddressUrl: 'Settings/getExplorerAddressUrl'
        }),

        uniqId () {
            return this.$route.params.uniqId;
        },

        pr () {
            return this.paymentRequests[this.uniqId] || throw `unknown payment request '${this.uniqId}'`;
        },

        title () {
            return this.pr.label || 'Payment Request';
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

            if (this.pr.message) {
                params.push(`message=${encodeURIComponent(this.pr.message)}`);
            }

            const paramsString = params.length ? `?${params.join('&')}` : '';

            clipboard.writeText(`zcoin://${this.pr.address}${paramsString}`);
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
</style>