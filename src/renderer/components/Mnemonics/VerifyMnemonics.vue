<template>
  <div class="container">
    <p style="text-align:center">
      <b><i>Type five words from your mnemonic recovery phrase below</i></b>
    </p>
    <div class="field-mnemonic-animated" style="text-align:center">
      <input v-if="selectWords()[0] != ''" type="text" class="missing" v-model="typedWords[0]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[0]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[1] != ''" type="text" class="missing" v-model="typedWords[1]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[1]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[2] != ''" type="text" class="missing" v-model="typedWords[2]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[2]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[3] != ''" type="text" class="missing" v-model="typedWords[3]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[3]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[4] != ''" type="text" class="missing" v-model="typedWords[4]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[4]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[5] != ''" type="text" class="missing" v-model="typedWords[5]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[5]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[6] != ''" type="text" class="missing" v-model="typedWords[6]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[6]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[7] != ''" type="text" class="missing" v-model="typedWords[7]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[7]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[8] != ''" type="text" class="missing" v-model="typedWords[8]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[8]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[9] != ''" type="text" class="missing" v-model="typedWords[9]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[9]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[10] != ''" type="text" class="missing" v-model="typedWords[10]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[10]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[11] != ''" type="text" class="missing" v-model="typedWords[11]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[11]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[12] != ''" type="text" class="missing" v-model="typedWords[12]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[12]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[13] != ''" type="text" class="missing" v-model="typedWords[13]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[13]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[14] != ''" type="text" class="missing" v-model="typedWords[14]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[14]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[15] != ''" type="text" class="missing" v-model="typedWords[15]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[15]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[16] != ''" type="text" class="missing" v-model="typedWords[16]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[16]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[17] != ''" type="text" class="missing" v-model="typedWords[17]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[17]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[18] != ''" type="text" class="missing" v-model="typedWords[18]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[18]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[19] != ''" type="text" class="missing" v-model="typedWords[19]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[19]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[20] != ''" type="text" class="missing" v-model="typedWords[20]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[20]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[21] != ''" type="text" class="missing" v-model="typedWords[21]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[21]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[22] != ''" type="text" class="missing" v-model="typedWords[22]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[22]" placeholder="______" @keypress="verifyFailed=false"/>

      <input v-if="selectedWords[23] != ''" type="text" class="missing" v-model="typedWords[23]" readonly/>
      <input v-else type="text" class="missing-tag" v-model="typedWords[23]" placeholder="______" @keypress="verifyFailed=false"/>
    </div>
    
    <div v-show="verifyFailed" class="red"><p><b>{{errorMessage}}</b></p></div>
    <div class="btn-group" style="text-align:center">
      <BaseButton @click="actions.prev" class="button" color="green">
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
  components: {
  },
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
    async verifyMnemonic() {
      try {
        var mnemonics = ``;
        for (const w of this.typedWords) {
          mnemonics = `${mnemonics} ${w}`;
        }
        mnemonics = mnemonics.substring(1);
        const d = mnemonics === this.actions.getCachedMnemonic();
        if (d != true) {
          this.verifyFailed = true;
        } else {
          this.actions.setCachedMnemonic('');
          this.actions.goTo("lock");
        }
      } catch (e) {
        this.verifyFailed = true;
      }
    },
    selectWords() {
      if (this.isWordSelected) return this.selectedWords;
      const mnemonics = this.actions.getCachedMnemonic();
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
  color:blue;
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
