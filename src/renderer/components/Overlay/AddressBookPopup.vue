<template>
  <section class="address-book-popup animated-table">
    <a class="close" @click="closePopup">&times;</a>
    <h4>
      Address Book
    </h4>
    <vuetable
      ref="vuetable"
      :api-mode="false"
      :fields="tableFields"
      :data-manager="dataManager"
      pagination-path="pagination"
      @vuetable:loaded="onLoadingCompleted"
      :track-by="trackBy"
      :per-page="perPage"
      @vuetable:pagination-data="onPaginationData"
    >
      <div slot="label" slot-scope="props" class="vuetable-label">
        {{ props.rowData.label }}
      </div>

      <div slot="address" slot-scope="props" class="vuetable-address" v-tooltip="purpose=='send'?'Select this address as transaction recipient':'Select this address as payment recipient'">
        <u
          ><a
            :style="{ cursor: 'pointer' }"
            @click.prevent="selectAddress(props.rowData)"
          >
            {{ props.rowData.address }}
          </a>
        </u>
      </div>

      <div slot="purpose" slot-scope="props" class="vuetable-address">
        {{ props.rowData.purpose }}
      </div>
      <div
        slot="actions"
        slot-scope="props"
        class="action-group"
        style="text-align:center"
      >
        <div
          class="action-group"
          v-clipboard="() => props.rowData.address"
          :style="{ cursor: 'pointer' }"
          @click.prevent="showCopied(props.rowData.address)"
          style="text-align:center"
        >
          <copy-address-icon />
        </div>

        <div
          class="action-group action-group-edit"
          @click="editAddress(props.rowData)"
          :style="{ cursor: 'pointer' }"
          style="text-align:center"
        >
          <edit-address-icon />
        </div>

        <div
          class="action-group"
          @click="deleteAddress(props.rowData)"
          :style="{ cursor: 'pointer' }"
        >
          <delete-address-icon />
        </div>
      </div>
    </vuetable>

    <div>
      <animated-table-pagination
        ref="pagination"
        @vuetable-pagination:change-page="onChangePage"
      />
    </div>

    <div class="popup-footer">
      <base-button color="white" @click="addNewAddress()">
        Add New Address
      </base-button>
    </div>
    <EditAddressBookPopup
      v-bind:label="editedLabel"
      v-bind:address="editedAddress"
      v-if="showEditAddressBook"
      @close-edit-address-book="closeEditAddressBook"
    />

    <AddressDeleteConfirm
      v-bind:label="deletedLabel"
      v-bind:address="deletedAddress"
      v-if="showDeleteAddressConfirm"
      @close-delete-address-book="closeDeleteAddressBook"
    />
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import { Vuetable } from "vuetable-2";
import _ from "lodash";
import CopyAddressIcon from "@/components//Icons/CopyAddressIcon";
import EditAddressIcon from "@/components//Icons/EditAddressIcon";
import DeleteAddressIcon from "@/components//Icons/DeleteAddressIcon";
import AnimatedTablePagination from "@/components/AnimatedTable/AnimatedTablePagination";
import EditAddressBookPopup from "@/components/Overlay/EditAddressBookPopup";
import AddressDeleteConfirm from "@/components/Overlay/AddressDeleteConfirm";
import types from "~/types";
import Vue from "vue";
import Toasted from 'vue-toasted';
Vue.use(Toasted)

import VueClipboards from "vue-clipboards";
Vue.use(VueClipboards);

import VTooltip from 'v-tooltip'
Vue.use(VTooltip)

const tableFields = [
  {
    name: "label",
    title: "Label",
    sortField: "label",
    width: "15%"
  },
  {
    name: "address",
    title: "Address",
    sortField: "address",
    width: "58%"
  },
  {
    name: "purpose",
    title: 'Type',
    width: "15%"
  },
  {
    name: "actions",
    width: "12%"
  }
];

export default {
  name: "AddressBookPopup",
  components: {
    Vuetable,
    CopyAddressIcon,
    EditAddressIcon,
    DeleteAddressIcon,
    AnimatedTablePagination,
    EditAddressBookPopup,
    VueClipboards,
    AddressDeleteConfirm
  },
  props: {
    trackBy: {
      type: String,
      default: "address"
    },
    sortOrder: {
      default: () => [
        {
          field: "label",
          direction: "asec",
          sortField: "label"
        }
      ]
    },
    perPage: {
      type: Number,
      default: 10
    },
    noDataMessage: {
      type: String,
      default: "No usable Transaction Ouput"
    }
  },
  data() {
    return {
      tableFields,
      filter: "",
      totalSelected: 0,
      selectedTx: {},
      unselected: {},
      showEditAddressBook: false,
      showDeleteAddressConfirm: false,
      editedLabel: "",
      editedAddress: "",
      deletedLabel: "",
      deletedAddress: "",
      needReloadData: false,
      rows: []
    };
  },
  created() {
    for (const [address, item] of Object.entries(this.addressBook)) {
      console.log("tabledata:", item);
      if (
        this.openAddressBook.purpose == "unknown" ||
        this.openAddressBook.purpose.toLowerCase() == item.purpose.toLowerCase()
      ) {
        this.rows.push({
          label: item.label,
          address: address,
          purpose: this.toFirstUpperCase(item.purpose)
        });
      }
    }
  },
  computed: {
    ...mapGetters({
      addressBook: "Transactions/addressBook",
      openAddressBook: "App/openAddressBook"
    }),

    tableData() {
      return this.rows;
    },

    filteredTableData() {
      return this.tableData;
    },

    purpose() {
      return this.openAddressBook.purpose.toLowerCase();
    }
  },
  watch: {
    $route(to, from) {
      this.$store.dispatch(types.app.OPEN_ADDRESS_BOOK, {open: false, purpose: ''});
    }
  },
  methods: {
    selectAddress(item) {
      this.$store.dispatch(types.app.OPEN_ADDRESS_BOOK, {
        open: false,
        address: item.address,
        purpose: item.purpose.toLowerCase()
      });
    },

    showCopied(addr) {
      this.$toasted.success('Copied ' + addr + ".", {position: 'top-center', duration: 2000});
    },

    async closeDeleteAddressBook(data) {
      this.showDeleteAddressConfirm = false;
      if (!data.updated) return;
      try {
        console.log("deleting address:", data.address);
        await this.$daemon.editAddressBook(
          data.address,
          data.label,
          this.openAddressBook.purpose.toLowerCase(),
          "delete",
          "",
          ""
        );
        this.$store.dispatch("Transactions/deleteAddressItem", data.address);
        const index = this.rows.findIndex(v => v.address == data.address);
        this.rows.splice(index, 1);
        this.$refs.vuetable.reload();
      } catch (e) {
        console.log(e);
      }
    },

    //data:{updated: bool, oldaddress, oldlabel, newaddress, newlabel, purpose}
    async closeEditAddressBook(data) {
      this.showEditAddressBook = false;
      console.log("closeEditAddressBook:", data);
      if (!data.updated) return; //cancel
      if (data.oldaddress === "") {
        //add new address
        this.rows.push({
          label: data.newlabel,
          address: data.newaddress,
          purpose: this.toFirstUpperCase(data.purpose)
        });
      } else {
        //edit existing address
        this.rows.forEach(item => {
          if (item.address === data.oldaddress) {
            item.address = data.newaddress;
            item.label = data.newlabel;
            item.purpose = this.toFirstUpperCase(data.purpose);
          }
        });
      }

      this.$refs.vuetable.reload();
    },
    comparePayments(a, b) {
      return !["blockHeight", "timestamp", "amount", "txId"].find(
        field => a[field] !== b[field]
      );
    },
    getRowClass(item, index) {
      const classes = [];

      if (item.isFulfilled) {
        classes.push("is-fulfilled");
      }
      if (item.isIncoming) {
        classes.push("is-incoming");
      }
      if (item.isReused) {
        classes.push("is-reused");
      }

      return classes.join(" ");
    },

    onPaginationData(paginationData) {
      this.$refs.pagination.setPaginationData(paginationData);
    },

    onChangePage(page) {
      this.rowTransition = "";
      this.$refs.vuetable.changePage(page);
      this.rowTransition = "fade";
    },

    dataManager(sortOrder, pagination) {
      if (this.tableData.length < 1) {
        return {
          data: []
        };
      }

      let local = this.tableData;
      const orderBy = sortOrder.length ? sortOrder : this.sortOrder;
      if (orderBy.length > 0) {
        local = _.orderBy(local, orderBy[0].sortField, orderBy[0].direction);
      }

      pagination = this.$refs.vuetable.makePagination(
        local.length,
        this.perPage
      );
      let from = pagination.from - 1;
      let to = from + this.perPage;

      return {
        pagination: pagination,
        data: _.slice(local, from, to)
      };
    },

    toFirstUpperCase(a) {
      return a.substring(0,1).toUpperCase() + a.substring(1).toLowerCase()
    },

    onLoadingCompleted() {
      if (this.selectedUtxos) {
        this.selectedUtxos.forEach(element1 => {
          let found = false;
          this.tableData.forEach(element2 => {
            if (element1.uniqId == element2.uniqId) {
              found = true;
            }
          });

          if (found) {
            if (!this.unselected[element1.uniqId]) {
              this.$refs.vuetable.selectId(element1.uniqId);
              if (!this.selectedTx[element1.uniqId]) {
                this.totalSelected += element1.amount;
              }
              this.selectedTx[element1.uniqId] = true;
            }
          }
        });
      }
    },

    editAddress(item) {
      this.editedLabel = item.label;
      this.editedAddress = item.address;
      this.showEditAddressBook = true;
    },

    async deleteAddress(item) {
      this.showDeleteAddressConfirm = true;
      this.deletedLabel = item.label;
      this.deletedAddress = item.address;
    },

    addNewAddress() {
      this.editedLabel = "";
      this.editedAddress = "";
      this.showEditAddressBook = true;
    },

    isLocked(dataItem) {
      return !dataItem.status;
    },
    closePopup() {
      this.$store.dispatch(types.app.OPEN_ADDRESS_BOOK, {
        open: false,
        address: ""
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.address-book-popup {
  position: absolute;
  top: 30px;
  bottom: 30px;
  left: 20px;
  right: 20px;
  padding: 20px;
  background: #fff;
  overflow: auto;
  .close {
    position: absolute;
    top: 15px;
    right: 30px;
    transition: all 200ms;
    font-size: 30px;
    font-weight: bold;
    text-decoration: none;
    color: #333;
    cursor: pointer;
  }
  .popup-footer {
    margin-top: 10px;
    h4 {
      display: inline-block;
    }
    > button {
      float: left;
      width: 40%;
      margin-top: 10px;
    }
  }
  .vuetable-timestamp {
    font-size: 11px;
  }
  .vuetable-amount > u {
    display: block;
    font-size: 8px;
    font-style: italic;
  }
  .tx-enable {
    // background: green;
    width: 78%;
    height: 5px;
    background: #58ca58;
    display: inline-block;
    > img {
      float: right;
      margin-top: -8px;
      margin-right: -13px;
      width: 15px;
      filter: invert(74%) sepia(13%) saturate(1998%) hue-rotate(85deg)
        brightness(93%) contrast(85%);
    }
  }
  .tx-disable {
    width: 78%;
    height: 5px;
    background: #ef3650;
    display: inline-block;
    margin-left: 12px;
    > svg {
      float: left;
      margin-top: -8px;
      margin-left: -13px;
    }
  }
}
.action-group {
  display: inline;
}
.action-group-edit {
  margin-left: 8px;
  margin-right: 8px;
}
</style>
