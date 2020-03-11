<template>
  <div>
    <p>
      <b><i>Re-type your mnemonic recovery phrase below</i></b>
    </p>
    <div style="text-align:center">
      <textarea
        v-model="mnemonicTyped"
        type="text"
        @keypress="verifyFailed=false"
        class="field-mnemonic"
      />
    </div>
    <div v-show="verifyFailed" class="red"><p><b>{{errorMessage}}</b></p></div>
    <div class="btn-group" style="text-align:center">
      <BaseButton @click="actions.prev" class="button" color="green">
        Back
      </BaseButton>
      <BaseButton @click="verifyMnemonic" class="button" color="green">
        Confirm
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
      mnemonicTyped: "",
      verifyFailed: false,
      errorMessage: 'Incorrect mnemonics!'
    };
  },
  created() {
      this.actions.setWalletIndexComplete(true);
  },
  methods: {
    async verifyMnemonic() {
      try {
        const mnemonics = await this.$daemon.showMnemonics("");
        const d = mnemonics === this.mnemonicTyped;
        if (d != true) {
          this.verifyFailed = true;
        } else {
          this.actions.goTo("lock");
        }
      } catch (e) {
        this.verifyFailed = true;
      }

      if (this.verifyFailed) {

      }
    }
  }
};
</script>

<style scoped>
.button {
  width: 35%;
}

.btn-group {
  width: 500px;
  margin-top: 30px;
}

.field-mnemonic {
  background-color: darkgrey;
  border: none;
  height: 4em;
  width: 100%;
  left: 20px;
  right: 20px;
  padding: 8px;
}
.red {
    color: red;
}
</style>
