<template>
    <div class="info-popup">
        <div class="title">Add Token</div>

        <div class="content">
            <SearchInput v-model="query" placeholder="Enter the transaction ID creating the token, or its property ID" />

            <div class="token-data">
                <div class="half-width">
                    <label>Token Name</label>
                    <div class="value">{{ property.name }}</div>
                </div>

                <div class="half-width">
                    <label>Balance</label>
                    <div class="value">{{ totalBalance }}</div>
                </div>

                <div class="half-width">
                    <label>Category</label>
                    <div class="value">{{ property.category }}</div>
                </div>

                <div class="half-width">
                    <label>Sub-Category</label>
                    <div class="value">{{ property.subcategory }}</div>
                </div>

                <div class="full-width">
                    <label>Description</label>
                    <div class="value double-height">{{ property.description }}</div>
                </div>

                <div class="full-width">
                    <label>URL</label>
                    <div class="value">
                        <a v-if="isValidUrl" @click="openExternal(property.url)" href="#">{{ property.url }}</a>
                        <template v-else>{{ property.url }}</template>
                    </div>
                </div>
            </div>
        </div>

        <div class="buttons">
            <button class="solid-button unrecommended" @click="$emit('cancel')">Cancel</button>
            <button class="solid-button recommended" @click="submit">OK</button>
        </div>
    </div>
</template>

<script>
import SearchInput from "renderer/components/shared/SearchInput";
import electron from "electron";

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

        async submit() {
            this.$emit('submit', tokenId);
        }
    }
}
</script>

<style scoped lang="scss">
.content {
    .token-data {
        margin: var(--padding-base);

        display: flex;
        flex-wrap: wrap;

        text-align: left;

        .half-width, .full-width {
            flex: 0;
        }

        .half-width {
            flex-basis: 50%;
        }

        .full-width {
            flex-basis: 100%;
        }

        label {
            color: var(--color-text-secondary);
        }

        .value {
            height: 1em;

            &.double-height {
                height: 3em;
            }

            overflow: hidden;

            margin: {
                top: calc(var(--padding-base) / 2);
                bottom: var(--padding-base);
            }
        }
    }
}
</style>