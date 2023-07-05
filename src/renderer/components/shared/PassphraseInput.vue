<template>
    <div class="info-popup passphrase-input">
        <div class="title">
            Enter Your Passphrase
        </div>

        <div class="content">
            <input
                v-focus
                type="password"
                v-model="passphrase"
                name="passphrase"
                placeholder="Enter Your Passphrase"
                @input="$emit('update:modelValue', $event.target.value)"
                @keyup.enter="$emit('confirm')"
            />

            <div v-if="error" class="error">
                {{ error }}
            </div>
        </div>

        <div class="buttons">
            <button class="solid-button unrecommended cancel" @click="$emit('cancel')">
                Cancel
            </button>

            <button class="solid-button recommended confirm" :disabled="!passphrase" @click="$emit('confirm')">
                Confirm
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PassphraseInput',

    props: {
        value: String,
        error: String
    },

    data() {
        return {
            passphrase: this.value
        };
    }
}
</script>

<style lang="scss" scoped>
@import "src/renderer/styles/info-popup";
@import "src/renderer/styles/passphrase-input";
</style>
