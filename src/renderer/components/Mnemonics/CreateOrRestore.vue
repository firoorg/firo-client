<template>
    <div>
        <h2 v-html="$t('Do You Want To Create A New Wallet Or Restore From Your Mnemonics?')"/>
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
            this.actions.next();
        },
        restoreWallet() {
            this.actions.goTo('restoreAskWalletOrigin');
        }
    }
}
</script>

<style scoped>
    .button {
        width: 500px;
        margin-top: 30px;
    }
</style>