<template>
    <div class="passphrase-input">
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
            <button @click="$emit('cancel')">
                Cancel
            </button>

            <button :disabled="!value" @click="$emit('confirm')">
                Confirm
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SendStepPassphrase',

    props: {
        value: {
            type: String,
            required: true
        },

        error: {
            type: String,
            default: null
        }
    }
}
</script>

<style lang="scss" scoped>
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/popup";
@import "src/renderer/styles/inputs";

@include popup();

input[type="password"] {
    @include wide-input-field();
}

.error {
    margin-top: $size-between-field-space-big;
    @include error();
}
</style>
