<template>
  <div id="app">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <p v-if="!askedPassphrase">
              <b
                ><i
                  >Type passphrase below to reveal recovery mnemonic phrase.</i
                ></b
              >
            </p>

            <p v-if="askedPassphrase">
              <b
                ><i
                  >See your reveal recovery mnemonic phrase below.</i
                ></b
              >
            </p>

            <div v-if="!askedPassphrase" class="field">
              <label
                ><i><b>Passphrase:</b></i></label
              >
              <input v-model="passphrase" type="password" />
            </div>

            <div v-if="askedPassphrase" class="field-mnemonic">
              <textarea v-model="mnemonic" type="text"/>
            </div>

            <div class="mnemonic-ok">
              <u
                ><a
                  :style="{ cursor: 'pointer' }"
                  @click.prevent="ok"
                >
                  <b><center>OK</center></b>
                </a>
              </u>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ShowMnemonicSettings",
  data() {
    return {
      askedPassphrase: false,
      passphrase: "",
      mnemonic:""
    };
  },
  methods: {
      async ok() {
          if (!this.askedPassphrase) {
              try {
                  this.mnemonic = await this.$daemon.showMnemonics(this.passphrase);
                  this.askedPassphrase = true;
              } catch(e) {

              }
          } else {
              this.$emit('close-mnemonic');
          }
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
</style>
