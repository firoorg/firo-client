<template>
    <div class="form">
        <header>
            <h2>
                <label for="passphrase">
                    Enter Your Passphrase
                </label>
            </h2>

            <div
                v-if="fromIncorrect"
                class="from-incorrect"
            >
                Please try again.
            </div>
        </header>

        <div class="control">
            <input
                id="passphrase"
                v-focus
                type="password"
                :value="value"
                name="passphrase"
                @input="$emit('input', $event.target.value)"
                @keyup.enter="$emit('onEnter')"
            />
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

        fromIncorrect: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style lang="scss" scoped>
.form {
    min-width: 20em;

    padding: {
        top: 2em;
        bottom: 2em;
        left: 3em;
        right: 3em;
    }

    .from-incorrect {
        font-size: 0.9em;
        font-style: italic;
    }

    input {
        width: 100%;
    }
}
</style>
