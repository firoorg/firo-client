<template>
    <div>
        <p v-if="isVerifedFirstTime === true" v-html="$t('Type the nineth word.')"/>
        <p v-if="isVerifedFirstTime !== true" v-html="$t('Type the third word.')"/>
        <input v-model="word" v-if="isVerifedFirstTime === true" placeholder="Type the nineth word"/>
        <input v-model="word" v-if="isVerifedFirstTime !== true" placeholder="Type the third word"/>
        <BaseButton
            @click="verifyWord"
            class="button"
            color="green"
        >
            Confirm
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
            word: '',
            isVerifedFirstTime: false
        }
    },
    methods: {
        async verifyWord() {
            try {
                const mnemonics = await this.$daemon.showMnemonics('');
                const d = mnemonics.includes(this.word);
                console.log("done!", d);
                if (d != true) {
                    return alert("Incorrect!");
                } else {
                    if (!this.isVerifedFirstTime) {
                        this.isVerifedFirstTime = true;
                        this.word = '';
                        alert("Successfully verified the third word!");
                    } else {
                        alert("Successfully verified mnemonic words!");
                        this.actions.next();
                    }
                }
            } catch (e) {
                console.log('erro:', e);
                alert("Error! ", e.toString());
            }
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