<template>
  <section class="evo-znode-page animated-table">
    <input
      class="control"
      v-focus
      @input="onInput"
      placeholder="Filter by label, ip address or collateral address"
      v-model="filter"
      style="font-style:italic"
    />
    <input
      class="round"
      v-model="showAllZnodes"
      type="checkbox"
      name="showallznodes"
      :checked="false"
      @change="showAllZnodesChange(showAllZnodes)"
    />
    <label for="showallznodes">
      Show all Znodes.
    </label>
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
      detail-row-component="evo-znodes-details-page"
    >
      <div slot="label" slot-scope="props">
        {{ props.rowData.label }}
      </div>

      <div slot="collateralAddress" slot-scope="props">
        {{ props.rowData.collateralAddress }}
      </div>

      <div slot="nextPaymentBlock" slot-scope="props">
        {{ props.rowData.nextPaymentBlock }}
      </div>

      <div slot="statusdetails" slot-scope="props">
        <p>{{ props.rowData.status }}</p>
      </div>

      <div slot="status" slot-scope="props">
        <ZnodeStatusGreen v-show="props.rowData.status=='ENABLED'" />
        <ZnodeStatusRed v-show="props.rowData.status!='ENABLED'" />
      </div>

      <div
        slot="expand"
        slot-scope="props"
        @click="onCellClicked(props.rowData)"
        :style="{ cursor: 'pointer' }"
      >
        <ZnodeCollapseButton v-show="props.rowData.expand" />
        <ZnodeExpandButton v-show="!props.rowData.expand" />
      </div>
    </vuetable>

    <div>
      <animated-table-pagination
        ref="pagination"
        @vuetable-pagination:change-page="onChangePage"
      />
    </div>
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import Vue from "vue";
import { Vuetable } from "vuetable-2";
import _ from "lodash";
import EvoZnodesDetailsPage from "./ZnodePage/EvoZnodesDetailsPage.vue";
import ZnodeStatusGreen from "@/components//Icons/ZnodeStatusGreen";
import ZnodeStatusRed from "@/components//Icons/ZnodeStatusRed";
import ZnodeCollapseButton from "@/components//Icons/ZnodeCollapseButton";
import ZnodeExpandButton from "@/components//Icons/ZnodeExpandButton";
import VueTableCheckbox from "@/components/Overlay/VueTableCheckbox";
import AnimatedTablePagination from "@/components/AnimatedTable/AnimatedTablePagination";
import { convertToSatoshi, convertToCoin } from "#/lib/convert";
Vue.component("vuetable-field-checkbox", VueTableCheckbox);
Vue.component("evo-znodes-details-page", EvoZnodesDetailsPage);

const tableFields = [
  {
    name: "label",
    title: "Label",
    sortField: "amount",
    width: "25%",
  },
  {
    name: "collateralAddress",
    title: "Collateral Address",
    sortField: "amount",
    width: "34%",
  },
  {
    name: "nextPaymentBlock",
    title: "Next Payment (Block)",
    width: "18%",
  },
  {
    name: "statusdetails",
    title: "Status",
    width: "13%",
  },
  {
    name: "status",
    title: "",
    width: "5%",
  },
  {
    name: "expand",
    title: "",
    width: "5%",
  },
];

export default {
  name: "EvoZnodesPage",
  components: {
    Vuetable,
    AnimatedTablePagination,
    EvoZnodesDetailsPage,
    ZnodeStatusRed,
    ZnodeStatusGreen,
    ZnodeExpandButton,
    ZnodeCollapseButton,
  },
  props: {
    trackBy: {
      type: String,
      default: "service",
    },
    sortOrder: {
      type: Array,
      default: () => [
        {
          field: "status",
          direction: "desc",
          sortField: "status",
        },
        {
          field: "nextPaymentBlock",
          direction: "desc",
          sortField: "nextPaymentBlock",
        },
      ],
    },
    perPage: {
      type: Number,
      default: 5,
    },
    noDataMessage: {
      type: String,
      default: "No usable Transaction Ouput",
    },
  },
  data() {
    return {
      tableFields,
      filter: "",
      totalSelected: 0,
      selectedTx: {},
      unselected: {},
      showAllZnodes: false,
      tableData: [],
      oldFilter: "",
      znodeRet: {},
      znodeList: {}
    };
  },
  mounted() {
    this.tableData = this.myZnodesTableData;
    this.$refs.vuetable.refresh();
  },

  async created() {
    this.znodeRet = await $daemon.getZnodeList();
    this.znodeList = this.znodeRet.nodes;
    console.log('loaded znode:', this.znodeList)
  },

  computed: {
    ...mapGetters({
      transactions: "Transactions/transactions",
    }),

    filterString() {
      return this.filter;
    },

    shouldShowAllZnodes() {
      return this.showAllZnodes;
    },

    filteredZnodesTableData() {
      return [];
    },

    filteredMyZnodesTableData() {
      return [];
    },

    allZnodesTableData() {
      const tableData = [];
      for (const znodeId of Object.keys(this.znodeList)) {
        let znodeObj = this.znodeList[znodeId];
        tableData.push({
          key: znodeId,
          label: (znodeObj.label && znodeObj.label.length > 0)? znodeObj.label:"(unlabelled)",
          collateralAddress: znodeObj.collateraladdress,
          lastpaid: znodeObj.lastpaidblock,
          nextPaymentBlock: 1000,
          status: znodeObj.status,
          expand: false,
          service: znodeObj.address,
          ownerAddress: znodeObj.owneraddress,
          PoSScore: znodeObj.posescore,
          registeredBlock: znodeObj.registeredblock,
          paymentAddress: znodeObj.payee
        })
      }
      return tableData;
    },

    myZnodesTableData() {
      const tableData = [];
      for (const znodeId of Object.keys(this.znodeList)) {
        let znodeObj = this.znodeList[znodeId];
        if (znodeObj.isMine) {
          console.log('znodeobject:', znodeObj)
          tableData.push({
            key: znodeId,
            label: (znodeObj.label && znodeObj.label.length > 0)? znodeObj.label:"(unlabelled)",
            collateralAddress: znodeObj.collateraladdress,
            lastpaid: znodeObj.lastpaidblock,
            nextPaymentBlock: 1000,
            status: znodeObj.status == "ENABLED",
            expand: false,
            service: znodeObj.address,
            ownerAddress: znodeObj.owneraddress,
            PoSScore: znodeObj.posescore,
            registeredBlock: znodeObj.registeredblock,
            paymentAddress: znodeObj.payee
          })
        }
      }
      return tableData;
    },

    filteredTableData() {
      return this.tableData;
    },
  },
  watch: {
    $route(to, from) {
      this.$store.dispatch("ZcoinPayment/TOGGLE_CUSTOM_INPUTS_POPUP");
    },
  },
  methods: {
    onCellClicked(data) {
      //collapse all rows
      for (var d of this.tableData) {
        if (d !== data) {
          if (d.expand) this.$refs.vuetable.toggleDetailRow(d.service);
          d.expand = false;
        }
      }
      data.expand = !data.expand;
      this.$refs.vuetable.toggleDetailRow(data.service);
    },

    async showAllZnodesChange(e) {
      this.oldFilter = "";
      this.applyFilter();
      this.$refs.vuetable.refresh();
    },

    onInput(event) {
      this.applyFilter();
      this.$refs.vuetable.refresh();
      this.oldFilter = this.filter;
    },

    applyFilter() {
      console.log('applyFilter:', this.allZnodesTableData)
      if (this.filter.length == 0) {
        if (this.showAllZnodes) {
          this.tableData = this.allZnodesTableData;
        } else {
          this.tableData = this.myZnodesTableData;
        }
        this.oldFilter = this.filter;
        return;
      }

      var tableRef = [];
      var tableOuts = [];
      if (this.showAllZnodes) {
        tableRef = this.allZnodesTableData;
      } else {
        tableRef = this.myZnodesTableData;
      }
      var newFilter = this.filter;
      if (this.oldFilter.length == 0 || !this.filter.includes(this.oldFilter)) {
        tableOuts = tableRef.filter(e =>
          (e.label && e.label.includes(newFilter)) || e.service.includes(newFilter) || e.collateralAddress.includes(newFilter)
        )
      } else {
        tableOuts = this.tableData;
        tableOuts = tableRef.filter(e =>
          (e.label && e.label.includes(newFilter)) || e.service.includes(newFilter) || e.collateralAddress.includes(newFilter))
      }
      this.tableData = JSON.parse(JSON.stringify(tableOuts));
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
          data: [],
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
        data: _.slice(local, from, to),
      };
    },

    convertToCoin: convertToCoin,
    convertToSatoshi: convertToSatoshi,
    toggleCheckbox(isCheck, dataItem) {
      if (!isCheck) {
        this.selectedTx[dataItem.uniqId] = false;
        if (dataItem.status) {
          this.totalSelected -= dataItem.amount;
        }
        this.unselected[dataItem.uniqId] = true;
      } else {
        console.log(
          "selectd:",
          dataItem.uniqId,
          ", address=",
          dataItem.address
        );
        this.selectedTx[dataItem.uniqId] = true;
        this.totalSelected += dataItem.amount;
        this.unselected[dataItem.uniqId] = false;
        dataItem.status = true;
      }
    },
    onLoadingCompleted() {
      if (this.selectedUtxos) {
        this.selectedUtxos.forEach((element1) => {
          let found = false;
          this.tableData.forEach((element2) => {
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
    toggleSlider(dataItem) {
      this.$refs.vuetable.toggleDetailRow(dataItem.uniqId);
      console.log("Slider is toggled:", this.selectedTx[dataItem.uniqId]);
      if (dataItem.status && this.selectedTx[dataItem.uniqId]) {
        this.$refs.vuetable.unselectId(dataItem.uniqId);
        this.selectedTx[dataItem.uniqId] = false;
        this.totalSelected -= dataItem.amount;
        this.unselected[dataItem.uniqId] = true;
      }
      dataItem.status = !dataItem.status;
    },
    isLocked(dataItem) {
      return !dataItem.status;
    },
    closePopup() {
      if (this.totalSelected === 0) {
        this.$store.dispatch("ZcoinPayment/UPDATE_CUSTOM_INPUTS", []);
      }
      this.$store.dispatch("ZcoinPayment/TOGGLE_CUSTOM_INPUTS_POPUP");
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  display: flex;
  padding-right: 0;
  width: 32%;
}
.evo-znode-page {
  //display: grid;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  top: 10%;
  left: 10px;
  left: 5%px;
  right: 10%;
  padding: 5%px;
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
  .vuetable-timestamp {
    font-size: 11px;
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

.round {
  position: relative;
  margin-bottom: 2%;
}

.round label {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 50%;
  cursor: pointer;
  height: 28px;
  left: 0;
  position: absolute;
  top: 0;
  width: 28px;
}

.round label:after {
  border: 2px solid #fff;
  border-top: none;
  border-right: none;
  content: "";
  height: 6px;
  left: 7px;
  opacity: 0;
  position: absolute;
  top: 8px;
  transform: rotate(-45deg);
  width: 12px;
}

.round input[type="checkbox"] {
  visibility: hidden;
}

.round input[type="checkbox"]:checked + label {
  background-color: #66bb6a;
  border-color: #66bb6a;
}

.round input[type="checkbox"]:checked + label:after {
  opacity: 1;
}
</style>
