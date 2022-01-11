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
                <div class="checkbox-field">
                    <PlusButton />
                    <label @click="showPopup = 'createToken'">Create Token</label>
                </div>

                <Popup v-if="showPopup == 'createToken'">
                    <CreateTokenForm @submit="beginCreateToken" @cancel="createTokenFormData = {}; showPopup = ''" />
                </Popup>
            </div>

            <div class="right-element action-element">
                <div class="checkbox-field">
                    <PlusButton />
                    <label @click="showPopup = 'addExistingToken'">Add Existing Token</label>
                </div>

                <Popup v-if="showPopup == 'addExistingToken'">
                    <AddTokenForm @submit="addToken" @cancel="showPopup = ''" />
                </Popup>
            </div>

            <div class="right-element">
                <div class="checkbox-field">
                    <input type="checkbox">
                    <label>Show Unknown Tokens</label>
                </div>
            </div>
        </div>

        <AnimatedTable
            no-data-message="You haven't added any tokens yet."
            :data="myTokensTableData"
            :fields="myTokensTableFields"
        />
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
import ElysiumTokenPublicBalance from "renderer/components/AnimatedTable/ElysiumTokenPublicBalance";
import PassphraseInput from "renderer/components/shared/PassphraseInput";

const myTokensTableFields = [
    {name: ElysiumTokenId},
    {name: ElysiumTokenTicker},
    {name: ElysiumTokenName},
    {name: ElysiumTokenPrivateBalance},
    {name: ElysiumTokenPublicBalance}
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
        AnimatedTable
    },

    data() {
        return {
            myTokensTableFields,
            searchInput: '',
            showPopup: '',
            passphrase: '',
            passphraseError: null,
            newTokenData: null
        };
    },

    computed: {
        ...mapGetters({
            selectedTokens: 'Elysium/selectedTokens',
            tokenData: 'Elysium/tokenData'
        }),

        myTokensTableData() {
            return this.selectedTokens
                .map(tk => this.tokenData[tk])
                .filter(tk => tk)
                .map(tk => {
                    const m = tk.name.match(/^(.*) \(([A-Z0-9]{3,4})\)$/);

                    return {
                        id: tk.id,
                        name: m ? m[1] : tk.name,
                        ticker: m ? m[2] : `E:${tk.id}`,
                        privateBalance: 0,
                        publicBalance: 0
                    };
                });
        }
    },

    methods: {
        ...mapActions({
            addSelectedTokens: 'Elysium/addSelectedTokens'
        }),

        async beginCreateToken(tokenData) {
            this.newTokenData = tokenData;
            this.showPopup = 'passphrase';
        },

        async completeCreateToken() {
            const d = this.newTokenData;
            try {
                await $daemon.createElysiumProperty(this.passphrase, true, d.isDivisible,
                    d.isDivisible ? `${d.issuanceAmount}000000` : d.issuanceAmount, d.name,
                    d.category, d.subcategory, d.description, d.url);

                this.showPopup = '';
                this.newTokenData = null;
            } catch (e) {
                this.passphraseError = e.message;
            }
        },

        addToken(tokenId) {
            this.showPopup = '';
            this.addSelectedTokens([tokenId]);
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