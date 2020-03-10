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
      <textarea v-model="mnemonic" type="text" class="field-mnemonic" />
    </div>
    <div v-if="actions.getWalletRecoveryType() == 'qt'" class="mnemonic-setting">
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
      <input v-model="protectivePassphrase" class='field' type="password" placeholder="Type protective passphrase here"/>
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
export default {
  name: "WalletRecovery",
  mixins: [GuideStepMixin],
  data() {
    return {
      picked: "",
      mnemonic: "",
      protectivePassphrase: "",
      showProtectivePP: false
    };
  },
  computed: {
    mnemonicType() {
      return this.actions.getWalletRecoveryType() == 'qt' ? "12/24" : "24";
    }
  },
  methods: {
    async submit() {
        await this.$daemon.importMnemonics('', this.mnemonic, this.protectivePassphrase);
        this.actions.next();
    },
    openProtectivePassphrse() {
      this.showProtectivePP = !this.showProtectivePP;
    }
  }
};
</script>

<style scoped>
.button {
  width: 200px;
}
.margin-set {
  margin-left: 40px;
}

.field-mnemonic {
  background-color: darkgrey;
  border: none;
  height: 4em;
  width: 27em;
  left: 20px;
  right: 20px;
  padding: 8px;
}
.mnemonic-setting {
  margin-bottom: 20px;
}
.field {
    margin-bottom: 1em;
    width: 27em;
}
</style>
