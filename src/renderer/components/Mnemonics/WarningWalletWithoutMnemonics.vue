<template>
  <div id="app">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div style="text-align:center">
              <h4><i>You are using a wallet without mnemonic support.</i></h4>
            </div>

            <div style="text-align:center">
              <h4>
                <i
                  >Please note that you would have to backup your wallet.dat
                  manually to prevent coin loss.</i
                >
              </h4>
            </div>

            <div style="text-align:center">
              <h4>
                <i
                  >You can do this by going to Settings > Backup > Backup Zcoin
                  Data and Saving it in a secure location.</i
                >
              </h4>
            </div>

            <div class="checkbox">
              <input
                v-model="dontShowMnemonicWarning"
                type="checkbox"
                name="dontShowMnemonicWarning"
                :checked="false"
              />

              <label for="dontShowMnemonicWarning">
                Don't remind me again.
              </label>
            </div>

            <BaseButton @click="confirm" class="button" color="green">
              I understand this.
            </BaseButton>
          </div>
        </div>
    </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "WarningWalletWithoutMnemonics",
  data() {
    return {
      dontShowMnemonicWarning: false
    };
  },
  methods: {
    async confirm() {
      if (this.dontShowMnemonicWarning) {
        this.$store.dispatch("Transactions/changeHasMnemonic", false);
        this.$store.dispatch("Transactions/changeShouldShowWarning", false);
        try {
          this.$daemon.writeShowMnemonicWarning(
            "",
            !this.dontShowMnemonicWarning
          );
        } catch (e) {
          console.log(e);
        }
      }
      this.$emit("close-mnemonic-warning");
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 500px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-style: bold;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
  font-style: bold;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.field {
  display: table-row;

  label,
  input {
    display: table-cell;
  }

  label {
    padding-right: 2em;
    padding-top: 1em;
  }

  input {
    background-color: $color--comet-medium;
    border: none;
    height: 1.5em;
    width: 23em;
    padding-bottom: 1em;

    &.non-matching {
      outline-style: auto;
      outline-color: red;
    }
  }
}

.mnemonic-ok {
  margin-top: 2em;
  margin-left: 50%;
  margin-right: 50%;
}

.field-mnemonic {
  display: table-row;

  label,
  textarea {
    display: table-cell;
  }

  label {
    padding-right: 2em;
    padding-top: 1em;
  }

  textarea {
    background-color: $color--comet-medium;
    border: none;
    height: 4.5em;
    width: 28em;
    padding-bottom: 1em;
    left: 20px;
    right: 20px;
    padding: 8px;

    &.non-matching {
      outline-style: auto;
      outline-color: red;
    }
  }
}

.button {
  width: 500px;
  margin-bottom: 20px;
}
.warning-message {
  text-align: center;
  font-style: bold italic;
  margin-bottom: 20px;
}
.checkbox {
  margin-bottom: 20px;
}
</style>
