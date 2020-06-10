<template>
    <div class="select-create-or-restore">
        <h2>
            Do you want to create a new wallet or restore with a mnemonic?
        </h2>

        <div class="buttons">
            <BaseButton
                @click="goBack"
                class="button"
                color="comet"
            >
                Go Back
            </BaseButton>

            <BaseButton
                @click="writeDownMnemonic"
                class="button"
                color="green"
            >
                Create New Wallet
            </BaseButton>

            <BaseButton
                @click="recoverFromMnemonic"
                class="button"
                color="green"
            >
                Recover from a Mnemonic
            </BaseButton>
        </div>
    </div>
</template>

<script>
import {generateMnemonic} from "#/daemon/zcoind";

export default {
    name: 'SelectCreateOrRestore',

    methods: {
        goBack() {
            this.$router.back();
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
.select-create-or-restore {
    width: fit-content;

    .buttons {
        width: fit-content;

        margin: {
            top: 20px;
            left: auto;
            right: auto;
        }

        .button {
            &:not(:first-child) {
                margin-left: 1em;
            }
        }
    }
}
</style>
