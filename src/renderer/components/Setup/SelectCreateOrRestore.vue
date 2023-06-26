<template>
    <div class="info-popup select-create-or-restore">
        <div class="content">Do you want to create a new wallet or recover with a seed phrase?</div>

        <div class="buttons">
            <button id="back-button" class="solid-button unrecommended" @click="goBack">
                Go Back
            </button>

            <button id="create-new-wallet" class="solid-button recommended" @click="writeDownMnemonic">
                Create a New Wallet
            </button>

            <button id="recover-from-mnemonic" class="solid-button recommended" @click="recoverFromMnemonic">
                Recover from a Seed Phrase
            </button>
        </div>
    </div>
</template>

<script>
import {generateMnemonic} from "daemon/firod";

export default {
    name: 'SelectCreateOrRestore',

    methods: {
        goBack() {
            // this.$router.back() fails if the select directory dialog was used on the SelectBlockchainLocation page.
            this.$router.push('/setup/select-blockchain-location');
        },

        async writeDownMnemonic() {
            if (!this.$store.getters['App/cachedMnemonic']) {
                this.$store.commit('App/setCachedMnemonic', {
                    // 256 bits of entropy translates into a 24 word mnemonic.
                    mnemonicPhrase: generateMnemonic(256),
                    mnemonicPassphrase: null,
                    isNewMnemonic: 1
                });

                // Wait for cachedMnemonic to propagate.
                while (!this.$store.getters['App/cachedMnemonic']) {
                    await new Promise(r => setTimeout(r, 5));
                }
            }

            this.$router.push('/setup/write-down-mnemonic');
        },

        recoverFromMnemonic() {
            this.$router.push('/setup/recover-from-mnemonic');
        }
    }
}
</script>

<style scoped lang="scss">
* {
    user-select: none !important;
}

.buttons {
    width: 800px;
    max-width: 800px;
}
</style>
