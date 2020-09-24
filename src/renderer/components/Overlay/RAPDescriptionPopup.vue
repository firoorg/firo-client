<template>
  <div id="app">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div style="text-align:center" class="take-note">
              <h3 style="color:red">Take Note</h3>
            </div>
            <div class="rap-description" style="text-align:justify">
              <div>
                <i
                  >This is a RAP address and some keychain wallets and exchanges
                  don't support RAP yet. Double check before requesting payments
                  with this address. A RAP address can be re-used without losing
                  anonymity.</i
                >
              </div>
            </div>
            <br />
            <div style="text-align:center">
              <base-button class="submit-button" @click="submitRapDescripton">
                OK
              </base-button>
            </div>
            <br />

            <div class="checkbox rap-description">
              <input
                v-model="dontRemind"
                class="remind-checkbox"
                type="checkbox"
                name="dontRemind"
                :checked="false"
              />

              <label for="dontRemind">
                Don't remind me again.
              </label>
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
  name: "RAPDescriptionPopup",
  data() {
    return {
      dontRemind: false,
    };
  },
  methods: {
    async submitRapDescripton() {
      console.log("submitRapDescripton: start")
      if (this.dontRemind) {
        try {
          await $daemon.writeRemindRAPDescription("", !this.dontRemind);
        } catch (e) {}
      }
      console.log("submitRapDescripton: finish")
      this.$emit("close-rap-description");
    },
  },
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
  box-shadow: 1 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-style: bold;
  border-radius: 10px !important;
  border: 1px solid #828282;
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


.checkbox {
  margin-bottom: 20px;
}

.rap-description {
  margin-left: 20px;
  margin-right: 20px;
  color: #373850;
  font-family: Lato;
}
.remind-checkbox {
  background-color: #39f;
  border-radius: 10px !important;
  border: 1px solid #39f;
}

.submit-button {
  margin: {
    top: 1em;
  }
  width: 50%;
}

.take-note {
  font-style: bold italic;
}

.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
}

/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  background-color: #ccc;
}

/* When the checkbox is checked, add a blue background */
.container input:checked ~ .checkmark {
  background-color: #2196F3;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>
