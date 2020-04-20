<template>
    <div>
        <h2 v-html="$t('Do you want to create a new wallet or restore from your mnemonics?')"/>
        <BaseButton
            @click="createNewWallet"
            class="button"
            color="green"
        >
            Create New Keychain Wallet
        </BaseButton>

        <BaseButton
            @click="restoreWallet"
            class="button"
            color="green"
        >
            Restore Keychain Wallet Using Recovery Phrase
        </BaseButton>
    </div>
</template>

<script>
import GuideStepMixin from '@/mixins/GuideStepMixin'
import {mapGetters} from "vuex";
import {generateMnemonic} from "#/daemon/zcoind";

export default {
    name: 'CreateOrRestore',

    mixins: [
        GuideStepMixin
    ],

    computed: mapGetters({
        zcoindNetwork: 'App/zcoinClientNetwork',
        zcoindLocation: 'App/zcoindLocation',
        blockchainLocation: 'App/blockchainLocation'
    }),

    methods: {
        async createNewWallet() {
            if (!this.actions.getCachedMnemonic()) {
                // 256 bits of entropy translates into a 24 word mnemonic.
                this.actions.setCachedMnemonic({mnemonic: generateMnemonic(256), mnemonicPassphrase: null});
            }

            this.actions.goTo("createWallet");
        },
        restoreWallet() {
            this.actions.goTo('restoreAskWalletOrigin');
        }
    }
}
</script>

<style scoped>
    .button {
        width: 100%;
        margin-top: 20px;
    }
</style>
