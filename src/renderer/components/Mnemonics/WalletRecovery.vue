<template>
    <div>
        <div style="text-align:center">
            <p>
                <b
                >Enter your {{ mnemonicType }} word mnemonic recovery phrase below.</b
                >
            </p>
        </div>
        <div style="text-align:center">
      <textarea
              v-model="mnemonic"
              type="text"
              class="field-mnemonic"
              @keydown="mnemonicValid = true"
      />
        </div>
        <div v-show="!mnemonicValid" class="red">
            <p>
                <b>{{ errorMessage }}!</b>
            </p>
        </div>
        <br />
        <div
                v-if="actions.getWalletRecoveryType() == 'qt'"
                class="mnemonic-setting"
        >
            <u
            ><a
                    :style="{ cursor: 'pointer' }"
                    @click.prevent="openProtectivePassphrse()"
            >
                I want to enter my protective passphrase as well
            </a>
            </u>
        </div>
        <div v-if="showProtectivePP">
            <input
                    v-model="protectivePassphrase"
                    class="field"
                    type="password"
                    placeholder="Type protective passphrase here"
            />
        </div>
        <div style="text-align:center">
            <BaseButton @click="submit" class="button" color="green">
                Submit
            </BaseButton>
        </div>
    </div>
</template>

<script>
import GuideStepMixin from "@/mixins/GuideStepMixin";
import { mapGetters } from "vuex";
import zcoind from "#/daemon/init";
import {validateMnemonic} from "#/daemon/zcoind";

export default {
    name: "WalletRecovery",

    mixins: [GuideStepMixin],

    data() {
        return {
            picked: "",
            mnemonic: "",
            protectivePassphrase: "",
            showProtectivePP: false,
            errorMessage: "Mnemonics recovery phrase is invalid!",
            mnemonicValid: true
        };
    },

    computed: {
        mnemonicType() {
            return this.actions.getWalletRecoveryType() === "qt" ? "12/24" : "24";
        },

        ...mapGetters({
            zcoinClientNetwork: "App/zcoinClientNetwork",
            zcoindLocation: "App/zcoindLocation",
            blockchainLocation: "App/blockchainLocation"
        })
    },

    methods: {
        async submit() {
            if (!validateMnemonic(this.mnemonic)) {
                this.mnemonicValid = false;
                this.errorMessage = result.reason;
                return;
            }

            this.actions.setCachedMnemonic({mnemonic: this.mnemonic, mnemonicPassphrase: this.protectivePassphrase || null});
            this.actions.goTo("lock");
        },
        openProtectivePassphrse() {
            this.showProtectivePP = !this.showProtectivePP;
        }
    }
};
</script>

<style lang="scss" scoped>
    .button {
        width: 200px;
    }
    .margin-set {
        margin-left: 40px;
    }

    .field-mnemonic {
        background-color: $color--comet-medium;
        border: none;
        height: 70px;
        width: 480px;
        left: 20px;
        right: 20px;
        padding: 8px;
        resize: none;
    }
    .mnemonic-setting {
        margin-bottom: 20px;
    }
    .field {
        margin-bottom: 1em;
        width: 27em;
    }
    .red {
        color: red;
    }
</style>
