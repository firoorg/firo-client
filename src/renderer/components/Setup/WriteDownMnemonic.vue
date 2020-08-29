<template>
    <div class="mnemonic-screen">
        <div class="guidance">
            Below is your 24-word passphrase. Write it down and keep it safe. You will shortly be asked to re-enter it.
        </div>

        <div class="mnemonic">
            <span v-for="(_, n) in 24" class="mnemonic-word visible">
                {{ words[n] }}
            </span>
        </div>

        <div class="buttons">
            <BaseButton @click="goBack" class="button" color="comet">
                Go Back
            </BaseButton>

            <BaseButton @click="confirmHasWrittenDown" class="button" color="green">
                I have written down my seed phrase
            </BaseButton>
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
@import '../../styles/_mnemonic.scss';
</style>
