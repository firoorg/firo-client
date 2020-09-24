<template>
  <section class="tx-info">
    <div class="title">
      {{ title }}
    </div>

    <div class="details">
      <div class="amount">
        <span :class="`${isIncoming ? 'incoming' : 'outgoing'}-amount`">
          {{ isIncoming ? "+" : "-" }}
          {{ convertToCoin(tx.amount) }}
        </span>

        XZC
      </div>

      <div v-if="!confirmations" class="unconfirmed-warning">
        This transaction is unconfirmed. Unconfirmed transactions can still be
        reversed, and should not be considered final.
      </div>

      <div v-else class="confirmations">
        This transaction has {{ confirmations }} confirmation{{
          confirmations > 1 ? "s" : ""
        }}
      </div>

      <div class="address">
        <label>Address:</label>

        <div
          class="value"
          v-clipboard="() => getPaymentCodeOrAddress()"
          :style="{ cursor: 'pointer' }"
        >
          {{ getAddress() }}
        </div>
      </div>

      <div class="txid">
        <label>Transaction ID:</label>

        <div class="value">
          {{ tx.txid }}
        </div>
      </div>

      <div class="block-explorer">
        <a @click.prevent="openExplorer" href="#">
          View Transaction in Block Explorer
        </a>
      </div>
    </div>

    <div v-if="isPrivate" class="privacy-message">
      This transaction is protected with Zcoin's Sigma technology. No one can
      see who sent it.
    </div>
    <div v-else-if="tx.paymentChannelID || tx.paymentCode" class="privacy-message">
      This transaction is protected with BIP47 transactional privacy technology.
    </div>
  </section>
</template>

<script>
import { shell } from "electron";
import { mapGetters } from "vuex";
import { convertToCoin } from "#/lib/convert";
import Vue from "vue";
import VueClipboards from "vue-clipboards";
Vue.use(VueClipboards);

export default {
  name: "TransactionInfo",
  components: {
    VueClipboards
  },

  computed: {
    ...mapGetters({
      transactions: "Transactions/transactions",
      currentBlockHeight: "Blockchain/currentBlockHeight",
      getExplorerTransactionUrl: "Settings/getExplorerTransactionUrl",
    }),

    uniqId() {
      return this.$route.params.uniqId;
    },

    tx() {
      return (
        this.transactions[this.uniqId] || throw `unknown txid '${this.uniqId}'`
      );
    },

    confirmations() {
      return this.tx.blockHeight
        ? this.currentBlockHeight - this.tx.blockHeight + 1
        : 0;
    },

    title() {
      if (this.tx.label) {
        return this.tx.label;
      }

      switch (this.tx.category) {
        case "spendIn":
        case "receive":
          return "Incoming Transaction";

        case "spendOut":
        case "send":
          return "Outgoing Transaction";

        case "mined":
          return "Mining Transaction";

        case "znode":
          return "Znode Payment";

        default:
          return `${this.tx.category} Transaction`;
      }
    },

    isIncoming() {
      return ["spendIn", "receive", "mined", "znode"].includes(
        this.tx.category
      );
    },

    isPrivate() {
      return ["spendIn", "spendOut"].includes(this.tx.category);
    },
  },

  methods: {
    convertToCoin,

    openExplorer() {
      shell.openExternal(this.getExplorerTransactionUrl(this.tx.txid));
    },

    getAddress() {
      if (this.tx.paymentChannelID || this.tx.paymentCode) {
        return this.shortenAddress(this.getPaymentCodeOrAddress());
      }
      return this.tx.address;
    },

    getPaymentCodeOrAddress() {
      if (this.tx.paymentChannelID || this.tx.paymentCode) {
        return this.tx.paymentChannelID? this.tx.paymentChannelID.split("-")[0]:this.tx.paymentCode;
      }
      return this.tx.address;
    },

    shortenAddress(addr) {
      if (addr.length < 20) {
        return addr;
      }
      return addr.substring(0, 10) + "..." + addr.substring(addr.length - 10);
    },
  },
};
</script>

<style scoped lang="scss">
.tx-info {
  height: 100%;
  background: $color--comet-light;
  color: $color--comet-dark;

  padding: {
    top: 2em;
    left: 2em;
    right: 2em;
  }

  font-size: 1.5em;

  .title {
    font-size: 2em;
  }

  .confirmations {
    font-size: 0.6em;
    font-style: italic;
    text-align: right;
  }

  .unconfirmed-warning {
    padding-top: 1em;
    padding-bottom: 2em;
    font-size: 0.6em;
    font-style: italic;
    text-align: center;
  }

  .details {
    @include detail-header();

    .amount {
      font-size: 1.5em;
      text-align: right;

      .incoming-amount {
        color: green;
      }

      .outgoing-amount {
        color: red;
      }
    }

    .address {
      padding-top: 0.5em;
      padding-bottom: 0.5em;

      .value {
        font-family: monospace;
        font-style: italic;
        font-size: 0.9em;
      }
    }

    .txid {
      padding-top: 0.5em;

      .value {
        font-size: 0.5em;
        font-family: monospace;
        font-style: italic;
      }
    }

    .block-explorer {
      font-size: 0.7em;
      font-style: italic;
      text-underline: none;
    }
  }

  .privacy-message {
    text-align: center;
    font-style: italic;
  }
}
</style>
