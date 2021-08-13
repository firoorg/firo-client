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

        <div class="two-button-holder">
            <button class="solid-button unrecommended" @click="$emit('cancel')">
                Cancel
            </button>

            <button class="solid-button recommended" :disabled="!value" @click="$emit('confirm')">
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
.passphrase-input {
    padding: var(--padding-popup);

    .title {
        text-align: center;
        font-weight: bold;
    }

    input {
        margin: {
            top: var(--padding-popup);
            bottom: var(--padding-popup);
            left: auto;
            right: auto;
        }

        width: 400px;
        height: 40px;

        padding: 10px;

        border: {
            color: var(--color-text-subtle-border);
            radius: 6px;
        }
    }

    .error {
        text-align: center;
    }
}
</style>
