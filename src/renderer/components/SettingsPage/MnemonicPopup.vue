<template>
    <div v-if="words" class="mnemonic-popup info-popup">
        <div class="title">
            Recovery Seed Phrase
        </div>

        <div class="content">
            <span v-for="(_, n) in 24" class="mnemonic-word">
                <span class="n">{{ n < 9 ? `0${n+1}` : n+1 }}</span>
                <span class="actual-word">{{ words[n] }}</span>
            </span>
        </div>

        <div class="buttons">
            <button class="solid-button recommended" @click="ok">Ok</button>
        </div>
    </div>

    <PassphraseInput v-else v-model="passphrase" :error="error" @cancel="ok" @confirm="showMnemonic" />
</template>

<script>
import PassphraseInput from "renderer/components/shared/PassphraseInput.vue";

export default {
    name: "MnemonicPopup",

    components: {
        PassphraseInput
    },

    mounted() {
        document.querySelector('body').classList.add('temporarily-disable-selection');
    },

    unmounted() {
        document.querySelector('body').classList.remove('temporarily-disable-selection');
        document.getSelection().removeAllRanges();
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

<style lang="scss">
@import "src/renderer/styles/info-popup";
@import "src/renderer/styles/mnemonic";

.mnemonic-popup {
    .content {
        @include mnemonic();
    }
}

.actual-word {
    user-select: text;
}

.temporarily-disable-selection *:not(.actual-word) {
    user-select: none !important;
}
</style>