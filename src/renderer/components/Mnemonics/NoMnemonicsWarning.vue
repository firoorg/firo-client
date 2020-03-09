<template>
    <div class="createnewwallet">
        <div class="warning-message"> <b><i><p v-html="$t('You are using a wallet without mnemonic support.')"/></i></b></div>
        
        <div class="warning-message"> <b><i><p v-html="$t('Please note that you would have to backup your wallet.dat manually to prevent coin loss.')"/></i></b></div>

        <div class="warning-message"> <b><i><p v-html="$t('You can do this by going to Settings > Backup > Backup Zcoin Data and Saving it in a secure location.')"/></i></b></div>

        <div class="checkbox">
             <input
                v-model="dontShowMnemonicWarning"
                type="checkbox"
                name="dontShowMnemonicWarning"
                :checked="false"/>
                                    
            <label for="dontShowMnemonicWarning">
                Don't remind me again.
             </label>
        </div>

        <BaseButton
            @click="confirm"
            class="button"
            color="green"
        >
            I understand this.
        </BaseButton>
    </div>
</template>

<script>
import GuideStepMixin from '@/mixins/GuideStepMixin'
import { mapGetters } from 'vuex';
export default {
    name: 'NoMnemonicsWarning',
    mixins: [
        GuideStepMixin
    ],
    data() {
        return {
            dontShowMnemonicWarning: false,
            data:''
        }
    },
    computed: {
        ...mapGetters({
            isInitialRun: 'App/isInitialRun',
            hasApiStatus: 'ApiStatus/hasApiStatus'
        })
    },
    methods: {
        async confirm() {
            if (this.hasApiStatus) {
                if (this.dontShowMnemonicWarning) {
                    try {
                        await this.$daemon.writeShowMnemonicWarning('', !this.dontShowMnemonicWarning);
                        console.log('initialRunn:', this.isInitialRun);
                    } catch(e) {
                        console.log(e);
                    }
                }
                
                this.actions.goTo('lock');
            }
        },
        isEnabled() {
            return true;
        }
    }
}
</script>

<style scoped>
    .button {
        width: 500px;
        margin-bottom: 20px;   
        margin-top: 
    }
    .warning-message {
        text-align: center;
        font-style: bold italic;
        margin-bottom:20px;
    }
    .checkbox {
        margin-bottom: 20px;
    }
</style>