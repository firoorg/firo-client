<template>
  <div class="waiting">
    <div class="icon">
      <loading-bounce class="bounce" />
    </div>
    <main>
      <h2>Recovering your keys and wallet transaction history</h2>
      <p>
        Please wait, this might take a minute or more, depending on your
        transaction history.
      </p>
    </main>
  </div>
</template>

<script>
import GuideStepMixin from "@/mixins/GuideStepMixin";
import LoadingBounce from "@/components/Icons/LoadingBounce";
import types from "~/types";
import { mapGetters } from "vuex";

export default {
  name: "RecoveringWallet",
  components: {
    LoadingBounce
  },
  mixins: [GuideStepMixin],
  data() {
    return {
      waitingMnemonicImport: false
    }
  },
  computed: {
    ...mapGetters({
      isRunning: "App/isRunning",
      apiStatus: "ApiStatus/apiStatus",
      hasApiStatus: "ApiStatus/hasApiStatus"
    })
  },
  watch: {
    async apiStatus(val) {
      await new Promise(r => setTimeout(r, 20000));
      console.log('API status:', this.apiStatus);
      if (
        this.isRunning &&
        this.apiStatus.data &&
        !this.apiStatus.data.rescanning && this.apiStatus.data.walletinitialized
      ) {
        this.actions.next();
      }
    }
  },
  //   mounted() {
  //     console.log("WalletRecovering:", this.isRunning);
  //     if (!this.isRunning && this.isWalletLoadingComplete) {
  //       this.actions.next();
  //     }
  //         console.log('mounted');

  //   },

  async created() {
    //this.waitForImport();
    await new Promise(r => setTimeout(r, 20000));
    console.log('API status:', this.apiStatus);
    if (
      this.isRunning &&
      this.apiStatus.data &&
      !this.apiStatus.data.rescanning &&
      this.apiStatus.data.walletinitialized
    ) {
      this.actions.next();
    }
  },
  methods: {
    waitForImport() {
      setTimeout(() => {
        this.waitingMnemonicImport = false;
      }, 20000);
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
