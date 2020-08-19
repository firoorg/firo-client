<template>
  <section class="receive-list">
    <div class="qr-code">
      <div ref="qrCode" />
      <div style="text-align:center">
        <p>
          <span style="font-weight: bold;">{{ selectedLabel }}</span>
          <br /><span>{{ selectedAddressShort }}</span>
        </p>
      </div>
    </div>

    <div class="popup-footer">
      <base-button
        class="rounded-btn"
        :style="styleRegularAddress"
        @click.prevent="showRegularAddress"
      >
        REGULAR ADDRESS
      </base-button>

      <base-button
        class="rounded-btn"
        :style="styleReusableAddress"
        @click.prevent="showReusableAddress"
      >
        REUSABLE ADDRESS
      </base-button>
    </div>
    <div class="animated-table-customized">
      <animated-table
        :data="filteredTableData"
        :fields="tableFields"
        track-by="address"
        no-data-message="noDataMessage"
        :sort-order="sortOrder"
        :row-class="onRowClass"
        :per-page="13"
        :on-page-change="(pageNumber) => (this.currentPage = pageNumber)"
      >
        <div slot="editlabel" slot-scope="props">
          <div
            class="action-group"
            @click="editLabel(props.rowData)"
            :style="{ cursor: 'pointer' }"
          >
            <modify-icon />
          </div>
        </div>

        <div
          slot="label"
          slot-scope="props"
          class="vuetable-label"
          @click.prevent="onRowClick(props.rowData)"
        >
          {{ props.rowData.label }}
        </div>

        <div
          slot="address"
          slot-scope="props"
          class="vuetable-label"
          @click.prevent="onRowClick(props.rowData)"
        >
          {{ props.rowData.shortAddress }}
        </div>

        <div slot="copy" slot-scope="props">
          <div
            class="action-group"
            v-clipboard="() => props.rowData.address"
            @click.prevent="copyAddress(props.rowData.shortAddress)"
            :style="{ cursor: 'pointer' }"
          >
            <copy-icon />
          </div>
        </div>
      </animated-table>
    </div>
    <overlay
      :opened="opened"
      :visible="visible"
      @closed="opened = visible = false"
    >
      <div style="text-align:center">
        <div class="close" @click="closeEdit">
          <a>&times;</a>
        </div>
        <b>Edit label</b>
        <div>
          <input
            type="text"
            v-model="labelResult"
            value=""
            placeholder="Start typing"
            width="200"
          />
        </div>
        <br />
        <base-button class="submit-button" @click="submit">
          OK
        </base-button>
      </div>
    </overlay>
    <br />
    <div id="wrap" v-if="!isRegularAddressSelected">
      <div
        class="icon"
        id="plus"
        :style="{ cursor: 'pointer' }"
        @click.prevent="createNewAddress"
      ></div>
      <div :style="{ cursor: 'pointer' }" @click.prevent="createNewAddress">
        <b>&nbsp;&nbsp;Create new</b>
      </div>
    </div>
  </section>
</template>

<script>
import QRCode from "easyqrcodejs";
import CopyIcon from "@/components//Icons/CopyIcon";
import ModifyIcon from "@/components//Icons/ModifyIcon";
import PlusIcon from "@/components//Icons/PlusIcon";
import AnimatedTable from "@/components/AnimatedTable/AnimatedTable";
import { Overlay } from "vuejs-overlay";
import { mapGetters } from "vuex";
import { add } from "winston";
import Vue from "vue";
import Toasted from "vue-toasted";
Vue.use(Toasted);
import VueClipboards from "vue-clipboards";
Vue.use(VueClipboards);
Vue.use(Overlay);

const tableFields = [
  {
    name: "editlabel",
    title: "Label",
    width: "4%",
  },
  {
    name: "label",
    width: "36%",
  },
  {
    name: "address",
    title: "Address",
    width: "55%",
  },
  {
    name: "copy",
    width: "5%",
  },
];

export default {
  name: "ReceiveList",

  components: {
    AnimatedTable,
    QRCode,
    CopyIcon,
    ModifyIcon,
    PlusIcon,
    Toasted,
    VueClipboards,
    Overlay,
  },

  props: {},

  data() {
    return {
      tableFields,
      filter: "",
      currentPage: 1,
      selectedStyle: "background-color: #E2E2E9; color: #F92848;",
      styleRegularAddress: "",
      styleReusableAddress: "",
      qrCode: null,
      isRegularAddressSelected: true,
      opened: false,
      visible: false,
      labelResult: "",
      regularAddressesData: [],
      stateAddressesChanged: false,
      addressBookChanged: false,
      selectedAddress: "",
      numUnlabelledAddress: 0
    };
  },

  watch: {
    currentPage(newPage, oldPage) {
      console.log(`currentPage: ${oldPage} -> ${newPage}`);
    },
    selectedAddress: function(newF, oldF) {
      this.generateQRCode();
    },
    stateAddresses: function(newF, oldF) {
      this.stateAddressesChanged = true;
      this.regularAddressTableData();
    },
    addressBook: function(newF, oldF) {
      this.addressBookChanged = true;
      this.regularAddressTableData();
    },
    numUnlabelledAddress: function(oldV, newV) {
      if (newV == 0) {
        this.generateNewRegularAddresses();
      }
    }
  },

  async mounted() {
    this.styleRegularAddress = this.selectedStyle;
    this.stateAddressesChanged = true;
    this.addressBookChanged = true;
    this.regularAddressTableData();
    if (this.numUnlabelledAddress == 0) {
      await this.generateNewRegularAddresses();
      this.regularAddressTableData();
    } 
    this.selectedAddress = this.regularAddressTableData[0].address;
    this.generateQRCode();
  },

  computed: {
    ...mapGetters({
      paymentCodes: "Transactions/paymentCodes",
      addressBook: "Transactions/addressBook",
      stateAddresses: "Transactions/addresses",
      apiStatus: 'ApiStatus/apiStatus',
    }),
    selectedAddressShort() {
      return this.shortenAddress(this.selectedAddress);
    },

    noDataMessage() {
      return apiStatus.data.hasMnemonic?"No Address Found.":"Reusable addressses not supported as your wallet does not have mnemonics recovery phrase";
    },

    latestTableData() {
      return tableData;
    },

    computeStateUnusedAddresses() {
      var ret = [];
      for (const k of Object.keys(this.addressBook)) {
        if (!this.stateAddresses[k] && this.addressBook[k].label != "Bip47Receive") {
          ret.push(k);
        }
      }
      return ret;
    },

    selectedLabel() {
      var ret = "";
      if (this.addressBook[this.selectedAddress]) {
        ret = this.addressBook[this.selectedAddress].label;
      } else if (this.paymentCodes[this.selectedAddress]) {
        ret = this.paymentCodes[this.selectedAddress]
      }
      if (ret == "") {
        return "(unlabelled)";
      }
      return ret;
    },

    filteredTableData() {
      if (!this.isRegularAddressSelected) {
        return this.paymentCodeTableData;
      }

      return this.regularAddressesData;
    },

    paymentCodeTableData() {
      var data = [];
      for (const paymentcode of Object.keys(this.paymentCodes)) {
        data.push({
          label: this.paymentCodes[paymentcode],
          shortAddress: this.shortenAddress(paymentcode),
          address: paymentcode,
        });
      }
      return data;
    },

    sortOrder() {
      return [
        {
          sortField: "date",
          direction: "desc",
        },
      ];
    },
  },

  methods: {
    async showRegularAddress() {
      if (this.isRegularAddressSelected) {
        return;
      }
      this.stateAddressesChanged = true;
      this.addressBookChanged = true;
      this.regularAddressTableData();
      console.log('numUnlabelledAddress:', this.numUnlabelledAddress)
      
      if (this.numUnlabelledAddress == 0) {
        this.selectedAddress = await this.generateNewRegularAddresses();
        this.regularAddressTableData();
      } else {
        this.selectedAddress = this.regularAddressesData[0].address;
      }
      this.isRegularAddressSelected = true; 
      this.styleRegularAddress = this.selectedStyle;
      // if (this.stateUnusedAddresses.length <= 4) {
      //   //await this.generateNewRegularAddresses();
      // }
      this.styleReusableAddress = "";
      this.generateQRCode();
    },
    showReusableAddress() {
      if (!this.isRegularAddressSelected) {
        return;
      }
      this.isRegularAddressSelected = false;
      if (this.filteredTableData.length > 0) {
        this.selectedAddress = this.filteredTableData[0].address;
        this.styleReusableAddress = this.selectedStyle;
        this.styleRegularAddress = "";
        this.generateQRCode();
      }
    },

    regularAddressTableData() {
      if (!this.addressBookChanged || !this.stateAddressesChanged) return;
      var data = [];
      var addresses = this.computeStateUnusedAddresses;
      this.numUnlabelledAddress = 0;
      if (addresses.length > 0) {
        for(const k of addresses) {
          data.push({
            label:
              !this.addressBook[k] ||
              this.addressBook[k].label == ""
                ? "(unlabelled)"
                : this.addressBook[k].label,
            address: k,
            shortAddress: this.shortenAddress(k),
          });
          if (!this.addressBook[k].label || this.addressBook[k].label == "") {
            this.numUnlabelledAddress++;
          }
        }
      }
      this.regularAddressesData = data;
      this.addressBookChanged = false;
      this.stateAddressesChanged = false;
    },

    generateQRCode() {
      if (!this.qrCode) {
        this.qrCode = new QRCode(this.$refs.qrCode, {
          text: this.selectedAddress,
          width: 256,
          height: 256,
          // $color--comet-dark
          colorDark: "#52527A",
          // $color--comet-light
          colorLight: "#E2E2E9",
          // This is an encoded version of https://zcoin.io/storage/2017/12/ci_icon_circle_green.png.zip
          logo:
            "data:image/png;base64, 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",
          // $color--comet-dark
          logoBackgroundColor: "#52527A",
          logoWidth: 45,
          logoHeight: 45,
        });
      } else {
        this.qrCode.makeCode(this.selectedAddress);
      }
    },
    async submit() {
      try {
        //edit
        if (this.isRegularAddressSelected) {
          await $daemon.editAddressBook(
            this.selectedAddress,
            this.selectedLabel,
            "receive",
            "edit",
            this.selectedAddress,
            this.labelResult
          );
          console.log("label result:", this.labelResult);
          this.$store.dispatch("Transactions/addAddressItem", {
            address: this.selectedAddress,
            label: this.labelResult,
            purpose: "receive",
          });
        } else {
          const data = await $daemon.editPaymentCodeBook(this.selectedAddress, this.labelResult);
          await this.$store.dispatch('Transactions/setPaymentCodes', data);
        }
      } catch (e) {
        console.log('Error: ', e)
      }
      this.opened = false;
      this.visible = false;
    },
    closeEdit() {
      this.opened = false;
      this.visible = false;
    },
    shortenAddress(addr) {
      if (addr.length < 20) {
        return addr;
      }
      return addr.substring(0, 10) + "..." + addr.substring(addr.length - 10);
    },

    editLabel(item) {
      console.log("jahdjhad");
      this.opened = this.visible = true;
    },
    copyAddress(addr) {
      this.$toasted.success("Copied " + addr + ".", {
        position: "top-right",
        duration: 1000,
      });
    },
    onRowClass(dataItem, index) {
      return dataItem.isOverdue ? "color-red" : "color-white";
    },
    async createNewAddress() {
      if (this.isRegularAddressSelected) {
        //
      } else {
        var newPaymentCode = await $daemon.createNewPaymentCode();
        console.log('newL:', newPaymentCode)
        await this.$store.dispatch('Transactions/setPaymentCodes', newPaymentCode);
      }
    },
    onRowClick(row) {
      if (this.selectedAddress != row.address) {
        this.selectedAddress = row.address;
        this.generateQRCode();
      }
    },
    async generateNewRegularAddresses() {
      var createds = [];
      try {
        var createdAddress = await $daemon.getUnusedAddress();
        createds.push({
          address: createdAddress,
          label: "",
          purpose: "receive",
        });
        console.log('created address:', createdAddress);
        await this.$store.dispatch("Transactions/setAddressBook", createds);
        return createdAddress;
      } catch(e) {
        console.log('error:', e)
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.close {
  position: absolute;
  right: 20px;
  top: 800;
  transition: all 200ms;
  font-size: 30px;
  font-weight: bold;
  text-decoration: none;
  color: #333;
  cursor: pointer;
}

.submit-button {
  margin: {
    top: 1em;
  }
  width: 50%;
}

.table-filter-input-wrap {
  text-align: right;
  margin-top: emRhythm(3) * -1;
  margin-bottom: emRhythm(5);

  .table-filter-input {
    width: 45%;
  }
}

.filter-input {
  position: relative;
  display: inline-block;
}

.rounded-btn {
  border-radius: 28px !important;
  border: none;
  background-color: $color--polo-light;
}

.qr-code {
  width: fit-content;
  margin: {
    top: 2em;
    bottom: 0em;
    left: auto;
    right: auto;
  }
}

.plus-btn {
  margin: {
    top: 0em;
    bottom: 0em;
    left: 0;
    right: auto;
  }
  border-radius: 28px !important;
  border: none;
  background-color: $color--polo-light;
}

.action-group {
  display: inline;
}

input {
  border: none;
  width: 50%;
  box-sizing: border-box;

  @include lato-font("normal");
  @include setType(5);
  @include rhythmBorderBottom(1px, 0);

  padding: 0 emRhythm($input-bleed);
  background: $color--white-light;
  border-bottom-style: solid;
  border-bottom-color: $color--polo-medium;
  outline: none;
  transition: background 0.15s ease-out, border-color 0.15s ease-out;
  color: $color--comet-dark;

  &::placeholder {
    color: $color--comet;
    font-style: italic;
  }

  &:hover,
  &:focus {
    background-color: $color--white;
    border-bottom-color: $color--polo;
  }
}

.animated-table-customized {
  .vuetable-body-wrapper {
    & > table {
      width: 100%;
      border-collapse: collapse;
    }
  }

  thead {
    text-align: left;

    th {
      @include font-heavy();
      color: $color--comet-dark;
      padding-bottom: emRhythm(2);

      &.sortable {
        transition: color 0.15s ease-out;
        position: relative;

        &:hover {
          color: $color--dark;

          .sort-icon {
            color: $color--comet-dark;
          }
        }

        .sort-icon {
          float: none !important;
          display: inline-block;
          color: $color--comet;
          padding-left: 0.5rem;
          // border: 1px solid blue;
          position: absolute !important;

          @include setType(1);
          font-style: normal;
          //transition: transform 0.25s ease-in-out;

          &:after {
            transition: all 0.25s ease-in-out;
          }

          &.sort {
            top: 0.75rem;
            padding-left: 0.35rem;

            &:after {
              // border: 1px solid red;

              //@include setType(1, $ms-up1);
              display: block;
              content: "‹›";
              transform: rotate(90deg);
            }
          }

          &.up,
          &.down {
            @include setType(1, $ms-up2);
            //height: 1.25rem;
            top: 0.45rem;
            padding-left: 0.75rem;
            box-sizing: border-box;
            position: relative;

            &:after {
              top: 50%;
              left: 50%;
              display: block;
              position: absolute;
              //border: 1px solid red;
              width: 0.5rem;
              height: 0.75rem;
              content: "‹";
              transform: rotate(270deg);
            }
          }

          &.down {
            &:after {
              transform: rotate(90deg);
            }
          }
        }
      }
    }
  }

  .vuetable-body {
    tr {
      $padding: 1;
      $border-size: 1px;

      $hover-opacity: 0.35;
      $hover-background-color: $color--polo-medium;

      $odd-opacity: 0.15;
      $odd-background-color: $color--polo-medium;

      cursor: pointer;
      position: relative;
      @include glow-transition-start($color--green);

      transition: box-shadow 0.15s ease-out;

      &.is-reused {
        @include glow-transition-start($color--orange);
      }

      td {
        position: relative;
        border-color: $color--polo-medium;
        // border-color: #fff;
        border-top-style: solid;
        @include rhythmBorderTop($border-size, $padding);
        padding-bottom: emRhythm($padding);
        transition: background-color 0.15s ease-in-out;

        &:first-child {
          margin-left: -1rem;
          padding-left: 1rem;
        }
        /*&:after {
                        border-bottom: 1px solid #fff;
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 1;

                        content: '';
                        width: 100%;
                    }*/
      }

      &:last-child td {
        border-bottom-style: solid;
        @include rhythmBorderBottom($border-size, $padding);
      }

      &:nth-child(odd) {
        background: rgba($odd-background-color, $odd-opacity);
      }

      &:hover {
        &:nth-child(odd) {
          td {
            background: rgba(
              $hover-background-color,
              $hover-opacity + $odd-opacity
            );
          }
        }

        td {
          background: rgba($hover-background-color, $hover-opacity);
        }
      }

      &.selected {
        position: relative;
        z-index: 1000;

        /*&:before {
                        position: absolute;
                        top: 0;
                        left: 0;

                        content: '';
                        width: 100%;
                        //height: 100%;
                        background: red;
                        border: 10px solid blue;
                    }*/
        @include glow-small-box($color--comet-dark-mixed);

        &.is-fulfilled {
          @include glow-small-box($color--green);

          td {
            background: $color--green;
          }

          & .tag {
            border-color: mix($color--comet-dark-mixed, $color--comet-dark);
          }

          &:hover td {
            background: mix(
              $color--green-bright,
              $color--green,
              (100% * $hover-opacity)
            );
          }

          &:nth-child(odd) {
            td {
              background: mix(
                $color--green-bright,
                $color--green,
                (100% * $odd-opacity / 2)
              );
            }

            &:hover td {
              background: mix(
                $color--green-bright,
                $color--green,
                (100% * ($hover-opacity + $odd-opacity) / 2)
              );
            }
          }
        }

        &.is-incoming {
          .payment-request-table-status path {
            fill: $color--white;
          }
        }

        &.is-reused {
          @include glow-small-box($color--orange);

          td {
            background: $color--orange;
          }

          & .tag {
            border-color: mix($color--orange, $color--orange-dark);
          }

          &:hover td {
            background: mix(
              $color--orange-bright,
              $color--orange,
              (100% * $hover-opacity)
            );
          }

          &:nth-child(odd) {
            td {
              background: mix(
                $color--orange-bright,
                $color--orange,
                (100% * $odd-opacity / 2)
              );
            }

            &:hover td {
              background: mix(
                $color--orange-bright,
                $color--orange,
                (100% * ($hover-opacity + $odd-opacity) / 2)
              );
            }
          }
        }

        & .tag {
          border-color: mix($color--green, $color--green-dark);
        }

        & .payment-request-table-status {
          &.is-fulfilled path {
            stroke: $color--white;
          }

          &:not(.is-fulfilled) g {
            fill: $color--white;
          }
        }

        td {
          background: $color--comet-dark-mixed;
          color: $color--white;
        }

        &:hover td {
          background: mix(
            $color--comet-dark-mixed,
            $color--polo,
            (100% * $hover-opacity)
          );
        }

        &:nth-child(odd) {
          td {
            background: rgba(
              $color--comet-dark-mixed,
              (100% * $odd-opacity / 2)
            );
          }

          &:hover td {
            background: mix(
              $color--comet-dark-mixed,
              $color--polo,
              (100% * ($hover-opacity + $odd-opacity) / 2)
            );
          }
        }
      }
    }

    &.fade-enter,
    &.fade-enter-active {
      background: red;
    }

    &.fade-leave-to {
      background: blue;
    }
  }
}

.icon:before {
  content: "";
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 1px solid black;
  font-size: 25px;
  color: black;
}
#bigplus:before {
  content: "\FF0B";
}
#plus:before {
  content: "+";
}
#wrap {
  display: flex;
  align-items: center;
  margin: 10px;
}
</style>
