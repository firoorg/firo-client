<template>
    <div class="createnewwallet">
        <p v-html="$t('Below is your 24-word passphrase. Write it down and keep it safe. You will be shortly asked to re-enter it.')"/>
        <p><b> {{mnemonics}} </b></p>
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
    data() {
        return {
            mnemonics: ''
        }
    },
    async created() {
        this.mnemonics = await this.$daemon.showMnemonics('');
        console.log('mnemonics:', this.mnemonics);
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
        background-color: rgb(138, 187, 138);    
    }
    .createnewwallet {
        height: 1000px;
    }
</style>