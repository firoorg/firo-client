<template>
    <div class="info-popup confirm-mnemonic">
        <div class="title">
            Confirm Your Recovery Phrase
        </div>

        <div class="content">
            <template v-for="(_, n) in 24">
                <div class="mnemonic-word">
                    <span class="n">{{ n < 9 ? `0${n + 1}` : n + 1 }}</span>
                    <input v-if="hiddenWordPositions.includes(n)"
                        :class="['word', 'hidden', isVerified ? 'verified' : 'unverified']"
                        :id="`hidden-word-${n}`"
                        type="text"
                        v-model="newWords[n]"
                        spellcheck="false"
                        :tabindex="hiddenWordPositions.indexOf(n) + 1"
                    />
                    <span v-else class="word visible" :id="`visible-word-${n}`">
                        {{ newWords[n] }}
                    </span>
                </div>
            </template>
        </div>

        <div class="buttons">
            <button id="back-button" class="solid-button unrecommended" @click="goBack" tabindex="-1">
                Back
            </button>

            <button id="ok-button" class="solid-button recommended" @click="goToConfirmLockWallet" tabindex="-1" :disabled="!isVerified">
                Confirm
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
        this.newWords = this.cachedMnemonic.mnemonicPhrase.split(' ');
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
            return this.newWords.join(' ') === this.cachedMnemonic.mnemonicPhrase;
        }
    },

    methods: {
        goBack() {
            this.$router.back();
        },

        goToConfirmLockWallet() {
            this.$router.push({
                path: '/setup/lock-wallet',
                query: this.cachedMnemonic
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'src/renderer/styles/mnemonic';

.content {
    @include mnemonic();
}
</style>
