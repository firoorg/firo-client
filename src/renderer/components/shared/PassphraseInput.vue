<template>
    <div class="info-popup passphrase-input">
        <div class="title">
            Enter Your Passphrase
        </div>

        <div class="content">
            <input
                v-focus
                type="password"
                :value="value"
                name="passphrase"
                placeholder="Enter Your Passphrase"
                @input="$emit('input', $event.target.value)"
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

            <button class="solid-button recommended confirm" :disabled="!value" @click="$emit('confirm')">
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
    }
}
</script>

<style lang="scss" scoped>
@import "src/renderer/styles/info-popup";
@import "src/renderer/styles/passphrase-input";
</style>
