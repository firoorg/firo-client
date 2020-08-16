<template>
  <div @click="onClick">
    <table
      class="znode-table"
      style="width:100%"
      rules=none
    >
      <colgroup>
        <col style="width: 24%;" />
        <col style="width: 35%;" />
        <col style="width: 41%;" />
      </colgroup>
      <tr class='znode-tr'>
        <td class='znode-td' style="background-color: #f0f3fc; font-weight:bold">Service</td>
        <td class='znode-td' style="background-color: #f0f3fc; font-weight:bold">PoSe Score</td>
        <td class='znode-td' style="background-color: #f0f3fc; font-weight:bold">Owner Address</td>
      </tr>
      <tr class='znode-tr'>
        <td style="border: none;background-color: white">{{ serviceIP }}</td>
        <td style="background-color: white">{{ PoSScore }}</td>
        <td style="background-color: white">{{ ownerAddress }}</td>
      </tr>
      <tr class='znode-tr'>
        <td class='znode-td' style="background-color: white; font-weight:bold">Registered (Block)</td>
        <td class='znode-td' style="background-color: white; font-weight:bold">Last Paid</td>
        <td class='znode-td' style="background-color: white; font-weight:bold">Payment Address</td>
      </tr>
      <tr>
        <td style="background-color: white">{{ registeredBlock }}</td>
        <td style="background-color: white">{{ lastpaid }}</td>
        <td style="background-color: white">{{ payoutAddress }}</td>
      </tr>
      <tr>
        <td class='znode-td' style="background-color: white; font-weight:bold">Operator Reward</td>
        <td class='znode-td' style="background-color: white; font-weight:bold"></td>
        <td class='znode-td' style="background-color: white; font-weight:bold"></td>
      </tr>
      <tr>
        <td style="background-color: white">{{ operatorReward }} </td>
        <td style="background-color: white"></td>
        <td style="background-color: white"></td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Vue from "vue";
import AnimatedTablePagination from "renderer/components/AnimatedTable/AnimatedTablePagination";
import { convertToSatoshi, convertToCoin } from "lib/convert";

export default {
  name: "EvoZnodesDetailsPage",
  props: {
    rowData: {
      type: Object,
      required: true,
    },
    rowIndex: {
      type: Number,
      required: true,
    },
  },
  computed: {
    znodeName() {
      return (this.rowData.label && this.rowData.label.length > 0)? this.rowData.label:"(unlabelled)";
    },
    collateralAddress() {
      return this.rowData.collateralAddress;
    },
    serviceIP() {
      return this.rowData.service;
    },
    PoSScore() {
      return this.rowData.PoSScore;
    },
    ownerAddress() {
      return this.rowData.ownerAddress;
    },
    registeredBlock() {
      return this.rowData.registeredBlock;
    },
    lastpaid() {
      return this.rowData.lastpaid;
    },
    payoutAddress() {
      return this.rowData.paymentAddress;
    },
    operatorReward() {
      return this.rowData.operatorReward? this.rowData.operatorReward: "NONE";
    },
  },
  methods: {
    onClick(event) {
    },
  },
};
</script>
<style>
.znode-table { 
  padding: 0;
  border:0;
  border-collapse: collapse;
  border: none;
}
.znode-td {
  border:none;
}

.tr {
  border: 0;
}
.znode-tr {
  border:0;
}

</style>
