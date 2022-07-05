<template>
    <div class="info-popup">
        <div class="title">Add Token</div>

        <div class="content">
            <SearchInput :lazy="true" v-model="query" placeholder="Enter the transaction ID creating the token, or its property ID" />

            <div v-if="property.notFound" class="not-found">
                Token Not Found
            </div>

            <div class="token-data">
                <div class="token-name">
                    <label>Token Name</label>
                    <div class="value">{{ property.name }}</div>
                </div>

                <div class="token-balance">
                    <label>Balance</label>
                    <div class="value">{{ totalBalance }}</div>
                </div>

                <div class="token-category">
                    <label>Category</label>
                    <div class="value">{{ property.category }}</div>
                </div>

                <div class="token-subcategory">
                    <label>Sub-Category</label>
                    <div class="value">{{ property.subcategory }}</div>
                </div>

                <div class="token-description">
                    <label>Description</label>
                    <div class="value">{{ property.description }}</div>
                </div>

                <div class="token-url">
                    <label>URL</label>
                    <div class="value">
                        <a v-if="isValidUrl" @click="openExternal(property.url)" href="#">{{ property.url }}</a>
                        <template v-else>{{ property.url }}</template>
                    </div>
                </div>

                <div class="token-creation-tx">
                    <label>Creation Transaction</label>
                    <div class="value">{{ property.creationTx }}</div>
                </div>
            </div>
        </div>

        <div class="buttons">
            <button class="solid-button unrecommended" @click="$emit('cancel')">Cancel</button>
            <button :disabled="!property.id" class="solid-button recommended" @click="ok">OK</button>
        </div>
    </div>
</template>

<script>
import SearchInput from "renderer/components/shared/SearchInput";
import electron from "electron";
import {mapMutations} from "vuex";

export default {
    name: "AddTokenForm",

    components: {
        SearchInput
    },

    data() {
        return {
            query: '',
            property: {}
        };
    },

    watch: {
        async query() {
            try {
                const p = await $daemon.getElysiumPropertyInfo(Number(this.query) || this.query);
                this.property = p.creationTx != "0000000000000000000000000000000000000000000000000000000000000000" ? p : {notFound: true};
            } catch (e) {
                if (e.name != 'FirodErrorResponse') throw e;
                this.property = {notFound: true};
            }
        }
    },

    computed: {
        isValidUrl() {
            if (!this.property.url) return false;
            try {
                const parsed = new URL(this.property.url);
                return parsed.protocol === 'https:';
            } catch {
                return false;
            }
        },

        totalBalance() {
            return '';
        }
    },

    methods: {
        openExternal: electron.shell.openExternal,
        ...mapMutations({
            addTokenData: 'Elysium/addTokenData'
        }),

        ok() {
            this.addTokenData([this.property]);
            this.$emit('submit', this.property.creationTx);
        }
    }
}
</script>

<style scoped lang="scss">
.content {
    .not-found {
        margin-top: var(--padding-base);
        font-weight: bold;
    }

    .token-data {
        margin: var(--padding-base);
        text-align: left;

        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-gap: var(--padding-base);

        .token-name {
            grid-row: 1;
            grid-column: 1;
        }

        .token-balance {
            grid-row: 1;
            grid-column: 2;
        }

        .token-category {
            grid-row: 2;
            grid-column: 1;
        }

        .token-subcategory {
            grid-row: 2;
            grid-column: 2;
        }

        .token-description {
            grid-row: 3 / 4;
            grid-column: 1 / 3;
        }

        .token-url {
            grid-row: 5;
            grid-column: 1 / 3;
        }

        .token-creation-tx {
            grid-row: 6;
            grid-column: 1 / 3;

            .value {
                // max width of a txid with our font
                min-width: 570px;
            }
        }

        label {
            display: block;
            color: var(--color-text-secondary);
        }

        .value {
            cursor: text;
            user-select: text;
            overflow: hidden;
            min-height: 1em;
            max-height: 4em;
            margin-top: calc(var(--padding-base) / 2);
        }
    }
}
</style>