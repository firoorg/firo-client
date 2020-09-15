<template>
  <div id="app">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <a
              class="close"
              :style="xStyle"
              @click="$emit('close-edit-address-book', { updated: false })"
              >&times;</a
            >
            <h4 v-if="isCreateNew()">
              <i>Add New Address</i>
            </h4>
            <h4 v-else>
              <i>Edit Address</i>
            </h4>

            <div class="field">
              <label
                ><i><b>Label:</b></i></label
              >
              <input type="text" v-if="!isCreateNew()" v-model="labelResult" />
              <input
                type="text"
                v-else
                v-model="labelResult"
                value=""
                placeholder="Type label here"
              />
            </div>

            <div class="field">
              <label
                ><i><b>Address:</b></i></label
              >
              <input
                type="text"
                v-if="!isCreateNew()"
                @keydown="checkAddressValidity"
                v-model="addressResult"
                readonly
              />
              <input
                type="text"
                v-else
                v-model="addressResult"
                value=""
                @keydown="checkAddressValidity"
                placeholder="Type address here"
              />
            </div>

            <div v-show="showError" class="red">
              <p>
                <b>{{ errorMessage }}!</b>
              </p>
            </div>

            <div class="btn-save">
              <u
                ><a :style="{ cursor: 'pointer' }" @click.prevent="submit">
                  <b><center>Save</center></b>
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
import { isValidPaymentCode } from "#/lib/isValidAddress";

export default {
  name: "EditAddressBookPopup",
  props: {
    label: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
  },
  created() {
    this.labelResult = this.label;
    this.addressResult = this.address;
    window.addEventListener("keypress", this.doCommand);
  },
  destroyed() {
    window.removeEventListener("keypress", this.doCommand);
  },
  computed: {
    ...mapGetters({
      addressBook: "Transactions/addressBook",
      paymentChannels: "Transactions/paymentChannels",
      openAddressBook: "App/openAddressBook",
    }),
  },
  data() {
    return {
      labelResult: "",
      addressResult: "",
      errorMessage: "Invalid address",
      showError: false,
      xStyle: "top: 245px",
      xStyleDefault: "top: 245px",
    };
  },
  methods: {
    async submit() {
      //verify address
      if (this.isCreateNew() && (this.addressBook[this.addressResult] || this.paymentChannels[this.addressResult])) {
        this.errorMessage = "Duplicate address!";
        this.showError = true;
        this.xStyle = "top: 225px";
        return;
      }
      try {
        if (this.isCreateNew()) {
          //adddress
          if (isValidPaymentCode(this.addressResult)) {
            const data = await $daemon.editPaymentCodeBook(this.addressResult, this.labelResult);
            this.$store.dispatch('Transactions/setPaymentChannels', Object.values(data));
            this.$emit("close-edit-address-book", {
              updated: true,
              oldaddress: "",
              oldlabel: "",
              newaddress: this.addressResult,
              newlabel: this.labelResult,
              purpose: this.openAddressBook.purpose.toLowerCase(),
            });
          } else {
            await $daemon.editAddressBook(
              this.addressResult,
              this.labelResult,
              this.openAddressBook.purpose.toLowerCase(),
              "add",
              "",
              ""
            );
            this.$store.dispatch("Transactions/addAddressItem", {
              address: this.addressResult,
              label: this.labelResult,
              purpose: this.openAddressBook.purpose.toLowerCase(),
            });
            this.$emit("close-edit-address-book", {
              updated: true,
              oldaddress: "",
              oldlabel: "",
              newaddress: this.addressResult,
              newlabel: this.labelResult,
              purpose: this.openAddressBook.purpose.toLowerCase(),
            });
          }
        } else {
          //edit
          if (isValidPaymentCode(this.addressResult)) {
            const data = await $daemon.editPaymentCodeBook(this.addressResult, this.labelResult);
            console.log('data:', data)
            this.$store.dispatch('Transactions/setPaymentChannels', Object.values(data));
            this.$emit("close-edit-address-book", {
              updated: true,
              oldaddress: this.address,
              oldlabel: this.label,
              newaddress: this.addressResult,
              newlabel: this.labelResult,
              purpose: this.openAddressBook.purpose.toLowerCase(),
            });
          } else {
            await $daemon.editAddressBook(
              this.address,
              this.label,
              this.openAddressBook.purpose.toLowerCase(),
              "edit",
              this.addressResult,
              this.labelResult
            );
            this.$store.dispatch(
              "Transactions/deleteAddressItem",
              this.address
            );
            this.$store.dispatch("Transactions/addAddressItem", {
              address: this.addressResult,
              label: this.labelResult,
              purpose: this.openAddressBook.purpose.toLowerCase(),
            });
            this.$emit("close-edit-address-book", {
              updated: true,
              oldaddress: this.address,
              oldlabel: this.label,
              newaddress: this.addressResult,
              newlabel: this.labelResult,
              purpose: this.openAddressBook.purpose.toLowerCase(),
            });
          }
        }
      } catch (e) {
        this.errorMessage = e.error.message;
        this.showError = true;
        this.xStyle = "top: 225px";
      }
    },
    isCreateNew() {
      return this.label === "" && this.address === "";
    },
    doCommand(e) {
      if (e.keyCode === 13) {
        this.submit();
      }
    },
    checkAddressValidity() {
      this.showError = false;
      this.xStyle = this.xStyleDefault;
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
