<template>
    <div class="info-popup confirm-step">
        <div class="title">
            Confirm {{ isPrivate ? '' : 'Public '}}Send
        </div>

        <table>
            <tr v-if="label">
                <td>Label</td>
                <td>{{ label }}</td>
            </tr>

            <tr>
                <td>Address</td>
                <td class="address value">{{ address }}</td>
            </tr>

            <tr>
                <td>Total to Send</td>
                <td><Amount class="value" :amount="total" ticker="FIRO" /></td>
            </tr>

            <tr>
                <td>Fee</td>
                <td><Amount class="value" :amount="fee" ticker="FIRO" /></td>
            </tr>

            <tr>
                <td>Amount to Receive</td>
                <td><Amount class="value" :amount="amount" ticker="FIRO" /></td>
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

export default {
    name: 'ConfirmStep',

    components: {
        Amount
    },

    props: {
        isPrivate: Boolean,
        label: String,
        address: String,
        amount: BigInt, // amount to receive
        fee: BigInt,
        total: BigInt // total to send
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";

.address.value {
    max-width: 400px;
}
</style>
