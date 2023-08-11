<template>
    <div class="info-popup confirm-step">
        <div class="title">
            Confirm Elysium Send
        </div>

        <table>
            <tr>
                <td>Token</td>
                <td>{{ assetInfo.name }}</td>
            </tr>

            <tr>
                <td>Token ID</td>
                <td>{{ assetInfo.id }}</td>
            </tr>

            <tr v-if="label">
                <td>Label</td>
                <td>{{ label }}</td>
            </tr>

            <tr>
                <td>Address</td>
                <td class="address value">{{ address }}</td>
            </tr>

            <tr>
                <td>Amount</td>
                <td><Amount class="value" :amount="amount" :ticker="assetInfo.ticker" /></td>
            </tr>
        </table>

        <div class="buttons">
            <button class="solid-button unrecommended" @click="$emit('cancel')">Cancel</button>
            <button class="solid-button recommended" @click="$emit('confirm')">Confirm</button>
        </div>
    </div>
</template>

<script>
// $emits: cancel, confirm
import Amount from "renderer/components/shared/Amount.vue";
import {mapGetters} from "vuex";

export default {
    name: 'SendStepConfirmElysium',

    components: {
        Amount
    },

    props: ['asset', 'label', 'address', 'amount'],

    computed: {
        ...mapGetters({
            tokenData: 'Elysium/tokenData'
        }),

        assetInfo() {
            return this.tokenData[this.asset];
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";
</style>
