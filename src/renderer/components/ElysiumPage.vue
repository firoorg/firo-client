<template>
    <div class="elysium-page">
        <Popup v-if="showPopup == 'passphrase'">
            <PassphraseInput :error="passphraseError" v-model="passphrase" @cancel="showPopup = ''" @confirm="completeCreateToken" />
        </Popup>

        <div class="header">
            <div class="search-input-holder">
                <SearchInput v-model="searchInput" placeholder="Search by token id, ticker, or name" />
            </div>

            <div class="right-element action-element">
                <div class="checkbox-field" @click="showPopup = 'createToken'">
                    <PlusButton />
                    <label id="createToken">Create Token</label>
                </div>

                <Popup v-if="showPopup == 'createToken'">
                    <CreateTokenForm @submit="beginCreateToken" @cancel="createTokenFormData = {}; showPopup = ''" />
                </Popup>
            </div>

            <div class="right-element action-element">
                <div class="checkbox-field" @click="showPopup = 'addExistingToken'">
                    <PlusButton />
                    <label>Add Existing Token</label>
                </div>

                <Popup v-if="showPopup == 'addExistingToken'">
                    <AddTokenForm @submit="addToken" @cancel="showPopup = ''" />
                </Popup>
            </div>

            <div class="right-element">
                <div class="checkbox-field">
                    <input type="checkbox" v-model="showUnknownTokens">
                    <label>Show Unknown Tokens</label>
                </div>
            </div>
        </div>

        <AnimatedTable
            no-data-message="You haven't added any tokens yet."
            :data="filteredMyTokensTableData"
            :fields="myTokensTableFields"
            :on-row-select="(rowData) => {selectedProperty = rowData; showPopup = 'propertyInfo'}"
        />

        <Popup v-if="showPopup == 'propertyInfo'">
            <PropertyInfo :creationtx="selectedProperty && selectedProperty.creationTx" @delete="deleteProperty" @ok="showPopup = ''" />
        </Popup>
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import SearchInput from "renderer/components/shared/SearchInput";
import PlusButton from "renderer/components/shared/PlusButton";
import Popup from "renderer/components/shared/Popup";
import CreateTokenForm from "renderer/components/ElysiumPage/CreateTokenForm";
import AddTokenForm from "renderer/components/ElysiumPage/AddTokenForm";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable";
import ElysiumTokenId from "renderer/components/AnimatedTable/ElysiumTokenId";
import ElysiumTokenTicker from "renderer/components/AnimatedTable/ElysiumTokenTicker";
import ElysiumTokenName from "renderer/components/AnimatedTable/ElysiumTokenName";
import ElysiumTokenPrivateBalance from "renderer/components/AnimatedTable/ElysiumTokenPrivateBalance";
import ElysiumTokenPendingBalance from "renderer/components/AnimatedTable/ElysiumTokenPendingBalance";
import PassphraseInput from "renderer/components/shared/PassphraseInput";
import PropertyInfo from "renderer/components/ElysiumPage/PropertyInfo";

const myTokensTableFields = [
    {name: ElysiumTokenId},
    {name: ElysiumTokenTicker},
    {name: ElysiumTokenName},
    {name: ElysiumTokenPrivateBalance},
    {name: ElysiumTokenPendingBalance}
];

export default {
    name: "ElysiumPage",

    components: {
        PassphraseInput,
        SearchInput,
        Popup,
        CreateTokenForm,
        AddTokenForm,
        PlusButton,
        AnimatedTable,
        PropertyInfo
    },

    data() {
        return {
            myTokensTableFields,
            searchInput: '',
            showPopup: '',
            passphrase: '',
            passphraseError: null,
            newTokenData: null,
            showUnknownTokens: false,
            selectedProperty: null
        };
    },

    computed: {
        ...mapGetters({
            selectedAndOwnedTokens: 'Elysium/selectedAndOwnedTokens',
            selectedTokens: 'Elysium/selectedTokens',
            tokenData: 'Elysium/tokenData',
            aggregatedBalances: 'Elysium/aggregatedBalances',
            availableUTXOs: 'Transactions/availableUTXOs'
        }),

        myTokensTableData() {
            return (this.showUnknownTokens ? this.selectedAndOwnedTokens : this.selectedTokens)
                .map(tk => this.tokenData[tk])
                .filter(tk => tk)
                .sort((a, b) => a.id - b.id)
                .map(tk => {
                    const b = this.aggregatedBalances[tk.creationTx] || {priv: 0, pending: 0};

                    return {
                        creationTx: tk.creationTx,
                        id: tk.id,
                        name: tk.nameMinusTicker,
                        ticker: tk.ticker,
                        privateBalance: tk.isDivisible ? b.priv : `${b.priv}`,
                        pendingBalance: tk.isDivisible ? b.pending : `${b.pending}`
                    };
                });
        },

        filteredMyTokensTableData() {
            if (!this.searchInput) return this.myTokensTableData;
            return this.myTokensTableData.filter(tk =>
                ['id', 'name', 'ticker', 'privateBalance', 'pendingBalance']
                    .map(f => tk[f])
                    .find(f => String(f).includes(this.searchInput))
            );
        }
    },

    methods: {
        ...mapActions({
            addSelectedTokens: 'Elysium/addSelectedTokens',
            removeSelectedTokens: 'Elysium/removeSelectedTokens'
        }),

        async beginCreateToken(tokenData) {
            this.newTokenData = tokenData;
            this.showPopup = 'passphrase';
        },

        async completeCreateToken() {
            const fromAddress = this.availableUTXOs.find(txo => txo.amount >= 0.002e8 && txo.destination && !txo.isPrivate)?.destination;
            if (!fromAddress) {
                this.passphraseError = 'Creating an Elysium property requires having a single non-locked transparent transaction output with a value >= 0.002 FIRO. Try sending FIRO to yourself first and then try again.';
                return;
            }

            const d = this.newTokenData;
            try {
                const r = await $daemon.createElysiumProperty(this.passphrase, fromAddress, d.isFixed,
                    d.isDivisible, (d.isFixed || undefined) && (d.isDivisible ? `${d.issuanceAmount}00000000` : d.issuanceAmount),
                    d.name, d.category, d.subcategory, d.description, d.url);

                $store.commit('Transactions/markSpentTransaction', r.inputs);
                this.addSelectedTokens([r.txid]);

                $store.commit('Transactions/markSpentTransaction', r.inputs);
                this.showPopup = '';
                this.newTokenData = null;
            } catch (e) {
                this.passphraseError = e.message;
            }
        },

        addToken(tokenId) {
            this.showPopup = '';
            this.addSelectedTokens([tokenId]);
        },

        deleteProperty() {
            if (!this.selectedProperty?.creationTx) return;
            if (!confirm("Are you sure you want to delete this property? You can always add it back later without losing your balance.")) return;
            this.removeSelectedTokens([this.selectedProperty.creationTx]);
            this.selectedProperty = null;
            this.showPopup = '';
        }
    }
}
</script>

<style scoped lang="scss">
.elysium-page {
    height: 100%;
    padding: var(--padding-base);

    display: flex;
    flex-direction: column;

    .header {
        width: 100%;
        display: flex;
        margin-bottom: var(--padding-base);

        .search-input-holder {
            flex-grow: 1;
        }

        .right-element {
            margin-left: var(--padding-base);

            padding: {
                top: 11px;
                bottom: 11px;
            }
        }

        .action-element {
            &, label {
                cursor: pointer;
            }
        }
    }

    .animated-table {
        flex-grow: 1;
    }
}
</style>