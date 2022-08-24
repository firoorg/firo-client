<template>
    <div class="info-popup">
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
                <td v-if="nPublicHolders"><Amount :amount="publicBalance" /> in 1 address</td>
                <td v-else><Amount :amount="0" /></td>
            </tr>
        </table>

        <div class="buttons">
            <button class="solid-button unrecommended" @click="$emit('delete')">
                Delete Property
            </button>

            <button class="solid-button recommended" @click="$emit('ok')">
                OK
            </button>
        </div>
    </div>
</template>

<script>
import {mapGetters} from "vuex";
import TransactionId from "renderer/components/shared/TransactionId";
import Amount from "renderer/components/shared/Amount";

export default {
    name: "PropertyInfo",
    components: {Amount, TransactionId},
    props: ['creationtx'],

    computed: {
        ...mapGetters({
            tokenData: 'Elysium/tokenData',
            balances: 'Elysium/balances'
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
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";
</style>