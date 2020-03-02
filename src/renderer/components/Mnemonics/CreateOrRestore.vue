<template>
    <div>
        <h1 v-html="$t('Create Or Restore?')"/>
        <BaseButton
            @click="createNewWallet"
            class="button"
        >
            Create New Keychain Wallet
        </BaseButton>

        <BaseButton
            @click="restoreWallet"
            class="button"
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
        createNewWallet() {
            this.actions.next();
        },
        restoreWallet() {
            this.actions.goToStep('createNewWallet');
        }
    }
}
</script>

<style scoped>
    .button {
        width: 500px;
        margin-top: 30px;
        background-color: rgb(138, 187, 138);
        color: black;
    }
</style>