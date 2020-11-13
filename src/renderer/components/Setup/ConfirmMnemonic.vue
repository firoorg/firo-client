<template>
    <div class="confirm-mnemonic">
        <div class="title">
            Enter the missing words from your mnemonic recovery phrase below:
        </div>

        <div class="content">
            <template v-for="(_, n) in 24">
                <input v-if="hiddenWordPositions.includes(n)"
                    :class="['mnemonic-word', 'hidden', isVerified ? 'verified' : 'unverified']"
                    :id="`hidden-word-${n}`"
                    type="text"
                    v-model="newWords[n]"
                    placeholder="______"
                    :tabindex="hiddenWordPositions.indexOf(n) + 1"
                />
                <span v-else class="mnemonic-word visible" :id="`visible-word-${n}`">
                    {{ newWords[n] }}
                </span>
            </template>
        </div>

        <div class="buttons">
            <button @click="goBack" tabindex="-1">
                Back
            </button>

            <button @click="goToConfirmLockWallet" tabindex="-1" :disabled="!isVerified">
                Submit
            </button>
        </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
    name: "ConfirmMnemonic",

    data() {
        return {
            newWords: [],
            hiddenWordPositions: []
        };
    },

    created() {
        this.newWords = this.cachedMnemonic.mnemonic.split(' ');
        this.hiddenWordPositions = [];

        // Fill hiddenWordPositions with 4 unique, random integers 0..24 and set the corresponding position of newWords
        // to the empty string.
        for (let i=0; i<5; i++) {
            let r;
            do {
                r = Math.floor(Math.random() * this.newWords.length);
            } while (this.hiddenWordPositions.includes(r))

            this.hiddenWordPositions.push(r);
            this.newWords[r] = '';
        }

        this.hiddenWordPositions = this.hiddenWordPositions.sort((a, b) => a-b);
    },

    computed: {
        ...mapGetters({
            cachedMnemonic: 'App/cachedMnemonic'
        }),

        isVerified() {
            return this.newWords.join(' ') === this.cachedMnemonic.mnemonic;
        }
    },

    methods: {
        goBack() {
            this.$router.back();
        },

        goToConfirmLockWallet() {
            this.$router.push({
                path: '/setup/lock-wallet',
                query: {
                    mnemonic: this.cachedMnemonic
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'src/renderer/styles/mnemonic';
@import 'src/renderer/styles/popup';

@include popup()

.confirm-mnemonic * {
    user-select: none;
}

.content {
    @include mnemonic();
}

.buttons {
    width: fit-content;
}
</style>
