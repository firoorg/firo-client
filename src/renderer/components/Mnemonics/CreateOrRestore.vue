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
export default {
    name: 'CreateOrRestore',
    mixins: [
        GuideStepMixin
    ],
    methods: {
        async createNewWallet() {
            const mnemonic = await this.$daemon.showMnemonics("");
            this.actions.setCachedMnemonic(mnemonic);
            this.actions.next();
        },
        restoreWallet() {
            this.actions.goTo('restoreAskWalletOrigin');
        },
        isEnabled() {
            return true;
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