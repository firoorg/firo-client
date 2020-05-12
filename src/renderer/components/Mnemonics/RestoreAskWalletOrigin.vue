<template>
    <div>
        <div style="text-align:center">
            <p><b><i>Was the keychain wallet created using this app or the Zcoin Qt app?</i></b></p>
            <p><i>If you are unsure, choose the Qt App option.</i></p> 
        </div>
        <br>
        <div class="margin-set">
            <input type="radio" id="client" value="client" v-model="picked">
            <label for="client">I used this app to create my keychain wallet.</label>
            <br>
            <input type="radio" id="qt" value="qt" v-model="picked">
            <label for="qt">I used the Qt app to create my keychain wallet.</label>
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
import GuideStepMixin from '@/mixins/GuideStepMixin';

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
        submit() {
            switch (this.picked) {
                case "qt":
                    this.actions.setWalletRecoveryType('qt');
                    break;

                case "client":
                    this.actions.setWalletRecoveryType('client');
                    break;

                default:
                    return;
            }

            this.actions.goTo("walletRecover");
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
