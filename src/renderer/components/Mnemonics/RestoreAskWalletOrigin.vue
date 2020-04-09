<template>
    <div>
        <div style="text-align:center">
            <p><b><i>Was the keychain wallet created using this app or the Zcoin Qt app?</i></b></p>
            <p><i>If you are unsure, choose the Qt App option.</i></p> 
        </div>
        <br>
        <div class="margin-set">
            <input type="radio" id="one" value="One" v-model="picked">
            <label for="one">I used this app to create my keychain wallet.</label>
            <br>
            <input type="radio" id="two" value="Two" v-model="picked">
            <label for="two">I used the Qt app to create my keychain wallet.</label>
            <br>
            <br>
        </div>
        <div style="text-align:center">
            <BaseButton @click="submit" class="button" color="green">
                Submit
            </BaseButton>
        </div>
    </div>
</template>

<script>
import GuideStepMixin from '@/mixins/GuideStepMixin'
export default {
    name: 'RestoreAskWalletOrigin',
    mixins: [
        GuideStepMixin
    ],
    data() {
        return {
            picked: ''
        }
    },
    methods: {
        async submit() {
            console.log('wallet:', this.actions)
            if (this.picked === 'One') {
                this.actions.setWalletRecoveryType('client');
                this.actions.next();
            } else if (this.picked === 'Two') {
                this.actions.setWalletRecoveryType('qt');
                this.actions.next();
            }
        }
    }
}
</script>

<style scoped>
.button {
    width: 300px;
}
.margin-set {
    margin-left: 40px;
}
</style>
