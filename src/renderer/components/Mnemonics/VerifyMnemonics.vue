<template>
    <div>
        <p v-html="$t('Below is your 24-word passphrase. Write it down and keep it safe. You will be shortly asked to re-enter it.')"/>
        <p> {{mnemonics}} </p>
        <BaseButton
            @click="confirmWriteDown"
            class="button"
        >
            I have written down my seed phrase
        </BaseButton>
    </div>
</template>

<script>
import GuideStepMixin from '@/mixins/GuideStepMixin'
export default {
    name: 'CreateNewWallet',
    mixins: [
        GuideStepMixin
    ],
    props: {
        mnemonics: String
    },
    methods: {
        confirmWriteDown() {
            this.actions.next();
        }
    }
}
</script>

<style scoped>
    .button {
        width: 500px;
        margin-top: 30px;
        background-color: rgb(138, 187, 138);    
    }
</style>