<template>
    <div class="small-mnemonic">
        <span v-for="(_, n) in 24" class="mnemonic-word">
            {{ words[n] }}
        </span>
    </div>
</template>

<script>
export default {
    name: "SmallMnemonic",

    props: {
        words: {
            type: Array,
            required: true
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/mnemonic";

.small-mnemonic {
    @include mnemonic();
}
</style>