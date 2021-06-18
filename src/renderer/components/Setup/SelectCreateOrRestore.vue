<template>
    <div class="select-create-or-restore">
        <div class="title">
            Do you want to create a new wallet or restore with a mnemonic?
        </div>

        <div class="buttons">
            <button id="back-button" @click="goBack">
                Go Back
            </button>

            <button id="create-new-wallet" @click="writeDownMnemonic">
                Create New Wallet
            </button>

            <button id="recover-from-mnemonic" @click="recoverFromMnemonic">
                Recover from a Mnemonic
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
                    mnemonic: generateMnemonic(256),
                    mnemonicPassphrase: null,
                    isNewMnemonic: true
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
@import "src/renderer/styles/popup";
@import "src/renderer/styles/sizes";

@include popup();

* {
    user-select: none !important;
}

.title {
    margin-bottom: $size-medium-space;

    .buttons {
        justify-content: space-between;
    }
}
</style>
