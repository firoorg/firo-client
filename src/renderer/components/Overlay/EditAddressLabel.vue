<template>
  <div id="app">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <a
              class="close"
              :style="xStyle"
              @click="$emit('receive-edit-address-label')"
              >&times;</a
            >
            
            <b>Edit label</b>

            <div class="field">
              <input
                type="text"
                v-model="labelResult"
                value=""
                placeholder="Start typing"
              />
            </div>

            <base-button
              @click="submit"
            >
              OK
            </base-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "EditAddressLabel",
  props: {
    label: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    }
  },
 
  computed: {
    ...mapGetters({
    })
  },
  data() {
    return {
      labelResult: "",
      xStyle: "top: 245px",
      xStyleDefault: "top: 245px"
    };
  },
  methods: {
    async submit() {
      try {
          //edit
          await $daemon.editAddressBook(
            this.address,
            this.label,
            this.openAddressBook.purpose.toLowerCase(),
            "edit",
            this.addressResult,
            this.labelResult
          );
          this.$store.dispatch("Transactions/deleteAddressItem", this.address);
          this.$store.dispatch("Transactions/addAddressItem", {
            address: this.addressResult,
            label: this.labelResult,
            purpose: this.openAddressBook.purpose.toLowerCase()
          });
          this.$emit("close-edit-address-book", {
            updated: true,
            oldaddress: this.address,
            oldlabel: this.label,
            newaddress: this.addressResult,
            newlabel: this.labelResult,
            purpose: this.openAddressBook.purpose.toLowerCase()
          });
      } catch (e) {
        this.xStyle = "top: 225px"
      }
    },

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
  .close {
    position: absolute;
    right: 430px;
    transition: all 200ms;
    font-size: 30px;
    font-weight: bold;
    text-decoration: none;
    color: #333;
    cursor: pointer;
  }
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
  width: 100%;
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

.red {
  color: red;
}

.btn-save {
  margin-top: 2em;
  margin-left: 50%;
  margin-right: 50%;
}
</style>
