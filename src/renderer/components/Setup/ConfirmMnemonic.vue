<template>
    <div class="mnemonic-screen">
        <div class="guidance">
            Enter the missing words from your mnemonic recovery phrase below:
        </div>

        <div class="mnemonic">
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
            <BaseButton @click="goBack" class="button" color="comet" tabindex="-1">
                Back
            </BaseButton>

            <BaseButton @click="goToConfirmLockWallet" class="button" id="submit-button" color="green" tabindex="-1" :disabled="!isVerified">
                Submit
            </BaseButton>
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
@import '../../styles/_mnemonic.scss';
</style>
