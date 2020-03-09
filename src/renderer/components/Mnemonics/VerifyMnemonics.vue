<template>
  <div>
    <p>
      <b><i>Re-type your mnemonic recovery phrase below</i></b>
    </p>
    <div style="text-align:center">
      <textarea v-model="mnemonicTyped" type="text" class="field-mnemonic" />
    </div>
    <BaseButton @click="verifyMnemonic" class="button" color="green">
      Confirm
    </BaseButton>
  </div>
</template>

<script>
import GuideStepMixin from "@/mixins/GuideStepMixin";
export default {
  name: "CreateNewWallet",
  mixins: [GuideStepMixin],
  data() {
    return {
      mnemonicTyped: ""
    };
  },
  methods: {
    async verifyMnemonic() {
      try {
        const mnemonics = await this.$daemon.showMnemonics("");
        const d = mnemonics === this.mnemonicTyped;
        if (d != true) {
          return alert("Incorrect!");
        } else {
          alert("Successfully verified mnemonic words!");
          this.actions.goTo("lock");
        }
      } catch (e) {
        console.log("erro:", e);
        alert("Error! ", e.toString());
      }
    }
  }
};
</script>

<style scoped>
.button {
  width: 500px;
  margin-top: 30px;
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
</style>
