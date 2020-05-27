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
    <div style="text-align:right">
      <p>Node Count: {{ tableData.length }}</p>
    </div>
    <vuetable
      ref="vuetable"
      :api-mode="false"
      :fields="tableFields"
      :data-manager="dataManager"
      pagination-path="pagination"
      @vuetable:loaded="onLoadingCompleted"
      :track-by="trackBy"
      :per-page="perPage"
      @vuetable:row-clicked="onExpandClicked"
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
        <ZnodeStatusGreen v-show="props.rowData.status == 'ENABLED'" />
        <ZnodeStatusRed v-show="props.rowData.status != 'ENABLED'" />
      </div>

      <div
        slot="expand"
        slot-scope="props"
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
import AnimatedTablePagination from "@/components/AnimatedTable/AnimatedTablePagination";
import { convertToSatoshi, convertToCoin } from "#/lib/convert";
Vue.component("evo-znodes-details-page", EvoZnodesDetailsPage);

const tableFields = [
  {
    name: "label",
    title: "Label",
    sortField: "amount",
    width: "22%",
  },
  {
    name: "collateralAddress",
    title: "Collateral Address",
    sortField: "amount",
    width: "37%",
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
      default: "No znodes",
    },
  },
  data() {
    return {
      tableFields,
      filter: "",
      showAllZnodes: false,
      tableData: [],
      oldFilter: "",
    };
  },
  mounted() {
    this.tableData = this.myZnodesTableData;
    this.$refs.vuetable.refresh();
  },

  computed: {
    ...mapGetters({
      masternodes: "Masternode/masternodes",
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
      for (const proTxHash of Object.keys(this.masternodes)) {
        let znodeObj = this.masternodes[proTxHash];
        console.log('znodeObj:', znodeObj)
        tableData.push({
          proTxHash: proTxHash,
          label:
            znodeObj.label && znodeObj.label.length > 0
              ? znodeObj.label
              : "(unlabelled)",
          collateralAddress: znodeObj.collateralAddress,
          lastpaid: znodeObj.state.lastPaidHeight,
          nextPaymentBlock: znodeObj.state.nextPaymentHeight? znodeObj.state.nextPaymentHeight: "UNKNOWN",
          status: znodeObj.state.status? znodeObj.state.status : "UNKNOWN",
          expand: false,
          service: znodeObj.state.service,
          ownerAddress: znodeObj.state.ownerAddress,
          PoSScore: znodeObj.state.PoSePenalty,
          registeredBlock: znodeObj.state.registeredHeight,
          paymentAddress: znodeObj.state.payoutAddress,
        });
      }
      return tableData;
    },

    myZnodesTableData() {
      const tableData = [];
      for (const proTxHash of Object.keys(this.masternodes)) {
        let znodeObj = this.masternodes[proTxHash];
        if (znodeObj.isMine) {
          tableData.push({
            proTxHash: proTxHash,
            label:
              znodeObj.label && znodeObj.label.length > 0
                ? znodeObj.label
                : "(unlabelled)",
            collateralAddress: znodeObj.collateraladdress,
            lastpaid: znodeObj.state.lastPaidHeight,
          nextPaymentBlock: znodeObj.state.nextPaymentHeight? znodeObj.state.nextPaymentHeight: "UNKNOWN",
            status: znodeObj.status,
            expand: false,
            service: znodeObj.state.service,
            ownerAddress: znodeObj.state.ownerAddress,
            PoSScore: znodeObj.state.PoSePenalty,
            registeredBlock: znodeObj.state.registeredHeight,
            paymentAddress: znodeObj.state.payoutAddress,
          });
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
    onExpandClicked(d) {
      this.onCellClicked(d.data);
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
      console.log("applyFilter:", this.allZnodesTableData);
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
        tableOuts = tableRef.filter(
          (e) =>
            (e.label && e.label.includes(newFilter)) ||
            e.service.includes(newFilter) ||
            e.collateralAddress.includes(newFilter)
        );
      } else {
        tableOuts = this.tableData;
        tableOuts = tableRef.filter(
          (e) =>
            (e.label && e.label.includes(newFilter)) ||
            e.service.includes(newFilter) ||
            e.collateralAddress.includes(newFilter)
        );
      }
      this.tableData = JSON.parse(JSON.stringify(tableOuts));
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
}

.round {
  position: relative;
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
