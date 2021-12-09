<template>
    <div class="elysium-page">
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
                    <CreateTokenForm @submit="createToken" @cancel="createTokenFormData = {}; showPopup = ''" />
                </Popup>
            </div>

            <div class="right-element action-element">
                <div class="checkbox-field">
                    <PlusButton />
                    <label @click="showPopup = 'addExistingToken'">Add Existing Token</label>
                </div>
            </div>

            <div class="right-element">
                <div class="checkbox-field">
                    <input type="checkbox">
                    <label>Show Unknown Tokens</label>
                </div>
            </div>
        </div>

        <div class="animated-table-container">
            <AnimatedTable
                no-data-message="You haven't added any tokens yet."
                :data="myTokensTableData"
                :fields="myTokensTableFields"
            />
        </div>
    </div>
</template>

<script>
import SearchInput from "renderer/components/shared/SearchInput";
import PlusButton from "renderer/components/shared/PlusButton";
import Popup from "renderer/components/shared/Popup";
import CreateTokenForm from "renderer/components/ElysiumPage/CreateTokenForm";
import AnimatedTable from "renderer/components/AnimatedTable/AnimatedTable";
import ElysiumTokenId from "renderer/components/AnimatedTable/ElysiumTokenId";
import ElysiumTokenTicker from "renderer/components/AnimatedTable/ElysiumTokenTicker";
import ElysiumTokenName from "renderer/components/AnimatedTable/ElysiumTokenName";
import ElysiumTokenPrivateBalance from "renderer/components/AnimatedTable/ElysiumTokenPrivateBalance";
import ElysiumTokenPublicBalance from "renderer/components/AnimatedTable/ElysiumTokenPublicBalance";

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
        SearchInput,
        Popup,
        CreateTokenForm,
        PlusButton,
        AnimatedTable
    },

    data() {
        return {
            searchInput: '',
            showPopup: '',
            myTokensTableFields,
            myTokensTableData: [
                {
                    id: 1,
                    name: 'Test Token',
                    ticker: 'TT',
                    privateBalance: 1e8,
                    publicBalance: 1e8+143,
                }
            ]
        };
    },

    methods: {
        createToken(createTokenFormData) {
            alert(JSON.stringify(createTokenFormData));
        }
    }
}
</script>

<style scoped lang="scss">
.elysium-page {
    height: 100%;
    padding: var(--padding-base);

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
}
</style>