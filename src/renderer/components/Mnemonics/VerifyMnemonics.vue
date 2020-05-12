<template>
    <div class="container">
        <p style="text-align:center">
            <b><i>Type five words from your mnemonic recovery phrase below</i></b>
        </p>
        <div class="field-mnemonic-animated" style="text-align:center">
            <template v-for="n in 24">
                <input v-if="selectWords()[n-1] !== ''" type="text" class="missing" v-model="typedWords[n-1]" readonly/>
                <input v-else type="text" class="missing-tag" v-model="typedWords[n-1]" placeholder="______" @keypress="verifyFailed=false"/>
            </template>
        </div>

        <div v-show="verifyFailed" class="red"><p><b>{{errorMessage}}</b></p></div>
        <div class="btn-group" style="text-align:center">
            <BaseButton @click="goBack" class="button" color="green">
                Back
            </BaseButton>
            <BaseButton @click="verifyMnemonic" class="button" color="green">
                Submit
            </BaseButton>
        </div>
    </div>
</template>

<script>
import GuideStepMixin from "@/mixins/GuideStepMixin";

export default {
    name: "CreateNewWallet",

    mixins: [GuideStepMixin],

    data() {
        return {
            verifyFailed: false,
            errorMessage: 'Incorrect mnemonics!',
            mnemonicWords: [],
            selectedWords: [],
            typedWords: [],
            isWordSelected: false
        };
    },

    created() {
        this.actions.setWalletIndexComplete(true);
    },

    methods: {
        goBack() {
            this.actions.goTo("createOrRestore")
        },

        async verifyMnemonic() {
            const mnemonics = this.typedWords.join(" ");
            if (mnemonics === this.actions.getCachedMnemonic().mnemonic) {
                console.log("going to lock step");
                // zcoind will be started in IntroScreenLockWallet.
                this.actions.goTo("lock");
            } else {
                this.verifyFailed = true;
            }
        },

        selectWords() {
            if (this.isWordSelected) return this.selectedWords;
            const mnemonics = this.actions.getCachedMnemonic().mnemonic;
            this.mnemonicWords = mnemonics.split(" ");
            this.selectedWords = this.mnemonicWords;
            var i = 0;
            while(i < 5) {
                const selectedIndex = Math.floor(Math.random() * 24);
                if (this.selectedWords[selectedIndex] != '') {
                    this.selectedWords[selectedIndex] = '';
                    console.log('Selected:', selectedIndex);
                    i++;
                }
            }
            this.isWordSelected = true;
            this.typedWords = JSON.parse(JSON.stringify(this.selectedWords));
            return this.selectedWords;
        }
    }
};
</script>

<style lang="scss" scoped>
    .button {
        width: 35%;
    }

    .btn-group {
        width: 500px;
        margin-top: 30px;
    }

    .field-mnemonic {
        background-color: $color--comet-medium;
        border: none;
        height: 4em;
        width: 100%;
        left: 20px;
        right: 20px;
        padding: 8px;
        resize: none;
    }
    .red {
        color: red;
    }


    .theme-material .tag-selector--input {
        border: none;
        border-bottom: 1px dotted #959595;
        margin-bottom: 1.2em;
    }
    .theme-material .tag-selector--item {
        background: #434343;
        color: #434343;
        margin-right: 8px;
        padding-left: 12px;
        border-radius: 32px;
    }
    .theme-material .tag-selector--item:hover {
        background: #434343;
        color: #fafafa;
    }
    .theme-material .tag-selector--item:hover .tag-selector--remove {
        color: #fafafa;
    }
    .theme-material .tag-selector--remove {
        width: 24px;
        height: 24px;
        color: #434343;
        margin: 4px 4px;
    }
    .theme-material .tag-selector--item,
    .theme-material .tag-selector-input {
        height: 32px;
        line-height: 32px;
        margin-bottom: 8px;
        font-size: 14px;
    }
    .theme-material .validation-message {
        color: #a90014;
    }
    .missing {
        border: none;
        border-color: transparent;
        background-color: $color--comet-medium;
        width: 24%;
    }

    .missing-tag {
        border: none;
        border-color: transparent;
        background-color: $color--comet-medium;
        width: 24%;
        font-weight:bold;
    }

    .field-mnemonic-animated {
        background-color:$color--comet-medium;
        border: none;
        height: 100;
        width: 450;
        padding: 8px;
        display: left;
        width: 100%;
    }

    .span {
        display: block;
        overflow: hidden;
        padding: 0 5px 0 0;
    }
</style>
