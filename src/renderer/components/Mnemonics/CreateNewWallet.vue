<template>
  <div class="createnewwallet">
    <div v-if="createdMnemonic == '' && !actions.getWalletIndexComplete() && apiStatus.data.rescanning" class="waiting">
      <div class="icon">
        <loading-bounce class="bounce" />
      </div>
      <main>
        <h2>Creating your wallet</h2>
        <p>Please wait, this might take a minute or two...</p>
      </main>
    </div>
    <div v-else>
      <div style="text-align:center">
        <b
          ><i
            ><p
              v-html="
                $t(
                  'Below is your 24-word passphrase. Write it down and keep it safe. You will be shortly asked to re-enter it.'
                )
              "/></i
        ></b>
      </div>
      <div style="text-align:center" class="margin-set">
        <textarea
          v-model="createdMnemonic"
          type="text"
          class="field-mnemonic"
          readonly
        />
        <BaseButton @click="confirmWriteDown" class="button" color="green">
          I have written down my seed phrase
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import GuideStepMixin from "@/mixins/GuideStepMixin";
import LoadingBounce from "@/components/Icons/LoadingBounce";
import { mapGetters } from "vuex";
export default {
  name: "CreateNewWallet",
  components: {
    LoadingBounce
  },
  mixins: [GuideStepMixin],
  data() {
    return {
      createdMnemonic: ""
    };
  },
  computed: {
    ...mapGetters({
      isRunning: "App/isRunning",
      apiStatus: "ApiStatus/apiStatus"
    })
  },
  created() {
    this.createdMnemonic = this.actions.getCachedMnemonic();
  },
  methods: {
    confirmWriteDown() {
      this.actions.setCachedMnemonic(this.createdMnemonic);
      this.actions.next();
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
  background-color: aqua;
  border: none;
  height: 4em;
  width: 100%;
  left: 20px;
  right: 20px;
  padding: 8px;
  margin-bottom: 2em;
  margin-top: 2em;
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
