<template>
    <div class="write-down-mnemonic">
        <div class="title">
            Below is your 24-word passphrase. Write it down and keep it safe. You will shortly be asked to re-enter it.
        </div>

        <div class="content">
            <span v-for="(_, n) in 24" class="mnemonic-word visible" :id="`mnemonic-word-${n}`">
                {{ words[n] }}
            </span>
        </div>

        <div class="buttons">
            <button @click="goBack">
                Go Back
            </button>

            <button @click="confirmHasWrittenDown">
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
@import 'src/renderer/styles/popup';

@include popup()

.title {
    user-select: none;
}

.content {
    user-select: text;
    @include mnemonic();
}

.buttons {
    width: fit-content;
}
</style>
