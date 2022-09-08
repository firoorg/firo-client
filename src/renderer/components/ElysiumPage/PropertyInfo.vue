<template>
    <div class="info-popup">
        <div v-if="show == 'main'">
            <div class="title">
                Property {{ property.id }} - {{ property.nameMinusTicker }}
            </div>

            <table>
                <tr>
                    <td>ID</td>
                    <td>{{ property.id }}</td>
                </tr>

                <tr>
                    <td>Name</td>
                    <td>{{ property.name }}</td>
                </tr>

                <tr>
                    <td>Category</td>
                    <td>{{ property.category }}</td>
                </tr>

                <tr>
                    <td>URL</td>
                    <td>{{ property.url }}</td>
                </tr>

                <tr>
                    <td>Divisible</td>
                    <td>{{ property.isDivisible }}</td>
                </tr>

                <tr>
                    <td>Managed</td>
                    <td>{{ property.isManaged }}</td>
                </tr>

                <tr>
                    <td>Issuer</td>
                    <td>{{ property.issuer }}</td>
                </tr>

                <tr>
                    <td>Creation Transaction</td>
                    <td><TransactionId :txid="property.creationTx" /></td>
                </tr>

                <tr>
                    <td>Private Balance</td>
                    <td><Amount :amount="balance.priv" /></td>
                </tr>

                <tr>
                    <td>Unconfirmed Private Balance</td>
                    <td><Amount :amount="balance.privUnconfirmed" /></td>
                </tr>

                <tr>
                    <td>Public Balance</td>
                    <td v-if="nPublicHolders > 1"><Amount :amount="publicBalance" /> in <b>{{ nPublicHolders }}</b> addresses</td>
                    <td v-else-if="nPublicHolders"><Amount :amount="publicBalance" /> in 1 address</td>
                    <td v-else><Amount :amount="0" /></td>
                </tr>

                <tr v-if="isMine && property.isManaged">
                    <td>Total Issued</td>
                    <td><Amount :amount="totalIssued" /></td>
                </tr>
            </table>

            <div class="buttons">
                <button class="solid-button unrecommended" @click="$emit('delete')">
                    Delete Property
                </button>

                <button v-if="isMine && property.isManaged" class="solid-button" @click="show = 'grantPrompt'">
                    Grant Tokens
                </button>

                <button class="solid-button recommended" @click="$emit('ok')">
                    OK
                </button>
            </div>
        </div>
        <div v-else-if="show == 'grantPrompt'" class="popup">
            <div class="title">
                Grant Tokens
            </div>

            <div class="content">
                <InputFrame label="Grantee">
                    <input
                        type="text"
                        name="grantee"
                        v-model="grantee"
                        v-validate="'firoAddress'"
                        v-tooltip="getValidationTooltip('grantee')"
                    />
                </InputFrame>

                <InputFrame label="Amount">
                    <input
                        type="text"
                        name="amount"
                        v-model="amount"
                        v-validate="{
                            numeric: true,
                            required: true,
                            min_value: property.isDivisible ? 1e-8 : 1,
                            max_value: maxIssue
                        }"
                        v-tooltip="getValidationTooltip('amount')"
                    />

                </InputFrame>
            </div>

            <div class="buttons">
                <button class="solid-button unrecommended" @click="goToMain">
                    Cancel
                </button>

                <button class="solid-button recommended" @click="show = 'passphrase'">
                    Grant Tokens
                </button>
            </div>
        </div>
        <PassphraseInput v-else-if="show == 'passphrase'" v-model="passphrase" :error="error" @cancel="goToMain" @confirm="attemptGrant" />
        <div v-else-if="show == 'grantSuccess'" class="popup">
            <div class="title">
                Success!
            </div>

            <div class="content">
                Granted <Amount :amount="amount" :ticker="property.ticker" /> to <span class="address">{{ grantee }}</span>
            </div>

            <div class="buttons">
                <button class="solid-button recommended" @click="goToMain">
                    OK
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {mapGetters} from "vuex";
import TransactionId from "renderer/components/shared/TransactionId";
import Amount from "renderer/components/shared/Amount";
import InputFrame from "renderer/components/shared/InputFrame";
import PassphraseInput from "renderer/components/shared/PassphraseInput";
import {isValidAddress} from "lib/isValidAddress";

export default {
    name: "PropertyInfo",
    components: {PassphraseInput, InputFrame, Amount, TransactionId},
    props: ['creationtx'],

    data() {
        return {
            show: 'main',
            grantee: '',
            amount: '',
            passphrase: '',
            error: ''
        };
    },

    inject: [
        '$validator'
    ],

    beforeMount() {
        this.$validator.extend('firoAddress', {
            getMessage: () => 'The Firo address you entered is invalid',
            validate: (value) => isValidAddress(value, this.network)
        });
    },

    computed: {
        ...mapGetters({
            network: 'ApiStatus/network',
            tokenData: 'Elysium/tokenData',
            balances: 'Elysium/balances',
            TXOMap: 'Transactions/TXOMap',
            availableUTXOs: 'Transactions/availableUTXOs',
            allTotalIssued: 'Elysium/totalIssued'
        }),

        property() {
            return this.tokenData[this.creationtx];
        },

        balance() {
            return this.balances[this.creationtx] || {priv: 0, privUnconfirmed: 0, pub: {}};
        },

        publicBalance() {
            return Object.values(this.balance.pub).reduce((a, x) => a + x, 0);
        },

        nPublicHolders() {
            return Object.values(this.balance.pub).filter(x => x > 0).length;
        },

        isMine() {
            return !!this.TXOMap[`${this.creationtx}-0`];
        },

        totalIssued() {
            return this.allTotalIssued[this.creationtx];
        },

        maxIssue() {
            // We need to switch to bigints to make this exact.
            return Math.max(0, (this.property.isDivisible ? (2**63-1)/1e8 : 2**63-1) - this.totalIssued);
        },

        getValidationTooltip() {
            return (fieldName) => ({
                content: this.validationErrors.first(fieldName),
                trigger: 'manual',
                boundariesElement: 'body',
                offset: 8,
                placement: 'right',
                classes: 'error popup-tooltip right-tooltip',
                show: true
            })
        }
    },

    methods: {
        goToMain() {
            this.show = 'main';
            this.grantee = '';
            this.amount = '';
            this.passphrase = '';
            this.error = '';
        },

        async attemptGrant() {
            const canGrant = !!this.availableUTXOs.find(txo => txo.amount >= 0.002e8 && txo.destination == this.property.issuer && !txo.isPrivate);
            if (!canGrant) {
                this.error = `To grant, send at least 0.003 FIRO to ${this.property.issuer} first.`;
                return;
            }

            try {
                await $daemon.grantElysium(this.passphrase, this.property.id, this.grantee, amount);
            } catch (e) {
                this.error = `${e.message}`;
                return;
            }

            this.show = 'grantSuccess';
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";
</style>