<template>
  <div id="app">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <h4>
              Are you sure you want to delete 
            </h4>
            <span>
              <i>{{address}}</i>
              <br/>
              <span v-if="label != ''">with label <i>{{label}}</i></span>
            </span>
            <h4>
              from your address book?
            </h4>

            <div class="btn-group" style="text-align:center">
              <BaseButton
                @click.prevent="
                  $emit('close-delete-address-book', { updated: false })
                "
                class="button"
                color="green"
              >
                Cancel
              </BaseButton>
              <BaseButton
                @click.prevent="
                  $emit('close-delete-address-book', { updated: true, address: address})
                "
                class="button"
                color="green"
              >
                Yes
              </BaseButton>
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
  name: "AddressDeleteConfirm",
  props: {
    label: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
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
  width: 400px;
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

.confirm-btn {
  margin-top: 2em;
  margin-left: 50%;
  margin-right: 50%;
}

.btn-group {
  margin-top: 30px;
}
</style>
