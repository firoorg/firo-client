<template>
    <div class="info-popup write-down-mnemonic">
        <div class="title">
            Write Down Your Seed Phrase
        </div>

        <div class="content">
            <div v-for="(_, n) in 24" class="mnemonic-word visible" :id="`mnemonic-word-${n}`">
                {{ words[n] }}
            </div>
        </div>

        <div class="buttons">
            <button id="back-button" class="solid-button unrecommended" @click="goBack">
                Go Back
            </button>

            <button id="confirm-button" class="solid-button recommended" @click="confirmHasWrittenDown">
                I have written down my seed phrase
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: "WriteDownMnemonic",

    computed: {
        words() {
            return this.$store.getters['App/cachedMnemonic'].mnemonic.split(' ');
        }
    },

    methods: {
        confirmHasWrittenDown() {
            this.$router.push('/setup/confirm-mnemonic');
        },

        goBack() {
            this.$router.back();
        }
    }
 }
</script>

<style scoped lang="scss">
@import 'src/renderer/styles/mnemonic';

.write-down-mnemonic {
    .content {
        user-select: text;
        @include mnemonic();
    }
}
</style>
