<template>
    <div class="createnewwallet">
        <div style="text-align:center">
            <b>
                <i>
                    <p>
                        Below is your 24-word passphrase. Write it down and keep it safe. You will be shortly asked to re-enter it.
                    </p>
                </i>
            </b>
        </div>

        <div class="margin-set" style="text-align:center">
            <textarea
                class="field-mnemonic"
                readonly
                type="text"
                :value="mnemonic"
            />

            <BaseButton @click="confirmWriteDown" class="button" color="green">
                I have written down my seed phrase
            </BaseButton>
        </div>
    </div>
</template>

<script>
import GuideStepMixin from "@/mixins/GuideStepMixin";

export default {
    name: "CreateNewWallet",

    mixins: [GuideStepMixin],

    computed: {
        mnemonic() {
            return this.actions.getCachedMnemonic().mnemonic;
        }
    },

    methods: {
        confirmWriteDown() {
            this.actions.goTo("verifyMnemonics");
        }
    }
};
</script>

<style lang="scss" scoped>
    .button {
        width: 80%;
    }

    .createnewwallet {
        height: 500px;
    }

    .field-mnemonic {
        background-color: $color--comet-medium;
        border: none;
        height: 70px;
        width: 480px;
        left: 20px;
        right: 20px;
        padding: 8px;
        margin-bottom: 2em;
        margin-top: 2em;
        resize: none;
    }

    .margin-set {
        margin-bottom: 1em;
    }

    .waiting {
        display: flex;
        align-items: center;
        padding-bottom: emRhythm(1);

        main {
            margin-left: emRhythm(3);
        }

        h2 {
            margin: 0 0 emRhythm(2, $ms-up2);
        }

        p:last-of-type {
            margin-bottom: 0;
        }

        .icon {
            $dim: emRhythm(12);
            width: $dim;
            height: $dim;
        }

        .bounce {
            $dim: emRhythm(6);
            width: $dim;
            height: $dim;
            margin-top: emRhythm(3);
            margin-left: emRhythm(5);
        }

        footer {
            padding-top: emRhythm(3);
            text-align: right;
        }
    }
</style>
