<template>
  <div class="waiting">
    <div class="icon">
      <loading-bounce class="bounce" />
    </div>
    <main>
      <h2>Recovering your wallet</h2>
      <p>Please wait, this should take less than a minute.</p>
    </main>
  </div>
</template>

<script>
import GuideStepMixin from "@/mixins/GuideStepMixin";
import LoadingBounce from '@/components/Icons/LoadingBounce'
import types from "~/types";
import { mapGetters } from "vuex";

export default {
  name: "RecoveringWallet",
  components: {
      LoadingBounce
  },
  mixins: [GuideStepMixin],
  computed: {
    ...mapGetters({
      isRunning: "App/isRunning"
    })
  },
  watch: {
    isRunning(val) {
      if (!this.isRunning) {
        this.actions.next();
      }
    }
  },
  mounted() {
    console.log('WalletRecovering:', this.isRunning);
    if (!this.isRunning) {
      this.actions.next();
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
