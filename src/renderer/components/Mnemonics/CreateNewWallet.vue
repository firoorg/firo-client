<template>
  <div class="createnewwallet">
    <p
      v-html="
        $t(
          'Below is your 24-word passphrase. Write it down and keep it safe. You will be shortly asked to re-enter it.'
        )
      "
    />
    <div style="text-align:center" class="margin-set">
      <textarea v-model="mnemonics" type="text" class="field-mnemonic" />
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
  data() {
    return {
      mnemonics: ""
    };
  },
  async created() {
    this.mnemonics = await this.$daemon.showMnemonics("");
    console.log("mnemonics:", this.mnemonics);
  },
  methods: {
    confirmWriteDown() {
      this.actions.next();
    }
  }
};
</script>

<style scoped>
.button {
  width: 30em;
}
.createnewwallet {
  height: 500px;
}
.field-mnemonic {
  background-color: darkgrey;
  border: none;
  height: 4em;
  width: 450px;
  left: 20px;
  right: 20px;
  padding: 8px;
  margin-bottom: 2em;
  margin-top: 2em;
}
.margin-set {
    margin-bottom: 1em;
}
</style>
