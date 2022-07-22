<template>
    <div v-if="words" class="info-popup">
        <div class="title">
            Recovery Seed Phrase
        </div>

        <div class="content">
            <span v-for="(_, n) in 24" class="mnemonic-word">
                {{ words[n] }}
            </span>
        </div>

        <div class="buttons">
            <button class="solid-button recommended" @click="ok">Ok</button>
        </div>
    </div>

    <PassphraseInput v-else v-model="passphrase" :error="error" @cancel="ok" @confirm="showMnemonic" />
</template>

<script>
import PassphraseInput from "renderer/components/shared/PassphraseInput";

export default {
    name: "MnemonicPopup",

    components: {
        PassphraseInput
    },

    data() {
        return {
            words: null,
            passphrase: '',
            error: null
        }
    },

    methods: {
        async showMnemonic() {
            try {
                this.words = await $daemon.showMnemonics(this.passphrase);
            } catch (e) {
                if (e.name === 'IncorrectPassphrase') {
                    this.error = 'Incorrect Passphrase';
                } else if (e && e.message) {
                    this.error = e.message;
                } else {
                    this.error = `${e}`;
                }
            }
        },

        ok() {
            this.words = null;
            this.error = null;
            this.$emit('ok');
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/info-popup";
@import "src/renderer/styles/mnemonic";

.content {
    @include mnemonic();
}
</style>