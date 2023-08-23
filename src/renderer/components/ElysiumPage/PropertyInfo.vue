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

        <Form v-else-if="show == 'grantPrompt'" class="popup" as="div" ref="grantTokenForm" :validation-schema="validationSchema" v-slot="{errors, meta}">
            <div class="title">
                Grant Tokens
            </div>

            <div class="content">
                <InputFrame label="Grantee">
                    <Field
                        type="text"
                        name="grantee"
                        v-model="grantee"
                        v-tooltip="errors.grantee"
                    />
                </InputFrame>

                <InputFrame label="Amount">
                    <Field
                        type="text"
                        name="amount"
                        v-model="amount"
                        v-tooltip="errors.amount"
                    />

                </InputFrame>
            </div>

            <div class="buttons">
                <button class="solid-button unrecommended" @click="goToMain">
                    Cancel
                </button>

                <button class="solid-button recommended" :disabled="!meta.valid" @click="show = 'passphrase'">
                    Grant Tokens
                </button>
            </div>
        </Form>

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
import {Form, Field} from "vee-validate";
import TransactionId from "renderer/components/shared/TransactionId.vue";
import Amount from "renderer/components/shared/Amount.vue";
import InputFrame from "renderer/components/shared/InputFrame.vue";
import PassphraseInput from "renderer/components/shared/PassphraseInput.vue";
import {isValidAddress} from "lib/isValidAddress";
import {bigintToString, stringToBigint} from "lib/convert";

export default {
    name: "PropertyInfo",
    components: {Form, Field, PassphraseInput, InputFrame, Amount, TransactionId},
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

    computed: {
        ...mapGetters({
            network: 'ApiStatus/network',
            tokenData: 'Elysium/tokenData',
            balances: 'Elysium/balances',
            TXOMap: 'Transactions/TXOMap',
            availableUTXOs: 'Transactions/availableUTXOs',
            allTotalIssued: 'Elysium/totalIssued'
        }),

        validationSchema() {
            [this.network, this.maxIssue, this.property.isDivisible];

            return {
                grantee: (value) => isValidAddress(value, this.network) || 'The Firo address you entered is invalid',
                amount: (value) => stringToBigint(value, this.property.isDivisible ? 8 : 0) <= this.maxIssue || `Only ${bigintToString(this.maxIssue)} tokens are available to mint.`
            }
        },

        property() {
            return this.tokenData[this.creationtx];
        },

        balance() {
            return this.balances[this.creationtx] || {priv: 0, privUnconfirmed: 0, pub: {}};
        },

        publicBalance() {
            return Object.values(this.balance.pub).reduce((a, x) => a + x, 0n);
        },

        nPublicHolders() {
            return Object.values(this.balance.pub).filter(x => x > 0n).length;
        },

        isMine() {
            return !!this.TXOMap[`${this.creationtx}-0`];
        },

        totalIssued() {
            return this.allTotalIssued[this.creationtx] || 0n;
        },

        maxIssue() {
            return 9223372036854775807n - this.totalIssued;
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
            const canGrant = !!this.availableUTXOs.find(txo => txo.amount >= 300000n && txo.destination == this.property.issuer && txo.privacyUse == 'public');
            if (!canGrant) {
                this.error = `To grant, send at least 0.003 FIRO to ${this.property.issuer} first.`;
                return;
            }

            try {
                await $daemon.grantElysium(this.passphrase, this.property.id, this.grantee, stringToBigint(this.amount));
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