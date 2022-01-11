<template>
    <div class="info-popup create-token-form">
        <div class="title">Create Token</div>

        <div class="content">
            <div class="line">
                <input
                    class="smooth-input"
                    type="text"
                    name="name"
                    placeholder="Name"
                    v-model="name"
                    v-validate="'required'"
                    v-tooltip="getValidationTooltip('name')"
                >

                <input
                    class="smooth-input"
                    type="text"
                    name="ticker"
                    placeholder="Ticker"
                    v-model="ticker"
                    v-validate="{required: true, regex: /^[A-Z0-9]{1,4}$/, is_not: 'FIRO'}"
                    v-tooltip="getValidationTooltip('ticker')"
                >
            </div>

            <div class="line">
                <input
                    class="smooth-input"
                    type="text"
                    placeholder="Category"
                    v-model="category"
                >

                <input
                    class="smooth-input"
                    type="text"
                    placeholder="Subcategory"
                    v-model="subcategory"
                >
            </div>

            <div class="line">
                <input
                    class="smooth-input"
                    type="text"
                    name="issuanceAmount"
                    placeholder="Issuance Amount"
                    v-model="issuanceAmount"
                    v-validate="{required: true, min_value: isDivisible ? 0.00000001 : 1, max_value: isDivisible ? 92233720368 : 9223372036854775807, integer: true}"
                    v-tooltip="getValidationTooltip('issuanceAmount')"
                >

                <div class="checkbox-container">
                    <div class="checkbox-field">
                        <input type="checkbox" v-model="isDivisible">
                        <label>Allow Fractional Sends</label>
                    </div>
                </div>
            </div>

            <textarea class="smooth-input" placeholder="Description" v-model="description" />

            <input
                class="url smooth-input"
                type="text"
                name="url"
                placeholder="URL"
                v-model="url"
                v-validate="{url: {require_protocol: true}}"
                v-tooltip="getValidationTooltip('url')"
            >
        </div>

        <div class="buttons">
            <button class="solid-button unrecommended" @click="$emit('cancel')">Cancel</button>
            <button class="solid-button recommended" @click="submit">OK</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "CreateTokenForm",

    inject: [
        '$validator'
    ],

    data() {
        return {
            name: '',
            ticker: '',
            category: '',
            subcategory: '',
            issuanceAmount: '',
            isDivisible: true,
            description: '',
            url: ''
        };
    },

    computed: {
        getValidationTooltip() {
            return (fieldName) => ({
                content: [this.validationErrors.first(fieldName)].map(x => x && fieldName === 'ticker' ? 'Ticker must be 3-4 capital letters, but not "FIRO"' : x)[0],
                trigger: 'manual',
                boundariesElement: 'body',
                offset: 8,
                placement: fieldName === 'ticker' ? 'right' : 'left',
                classes: 'error popup-tooltip' + (fieldName === 'ticker' ? ' right-tooltip' : ''),
                show: true
            })
        }
    },

    methods: {
        async submit() {
            if (!await this.$validator.validateAll()) return;

            const r = {};
            for (const p of ['name', 'ticker', 'category', 'subcategory', 'issuanceAmount', 'isDivisible', 'description', 'url']) {
                r[p] = this[p];
            }
            this.$emit('submit', r);
        }
    }
}
</script>

<style scoped lang="scss">
.create-token-form {
    .line {
        &:not(:first-child) {
            margin-top: var(--padding-base);
        }

        input[type="text"] {
            width: 200px;

            &:not(:last-child) {
                margin-right: var(--padding-base);
            }
        }

        .checkbox-container {
            display: inline-block;
            width: 200px;
            vertical-align: middle;
        }
    }

    textarea, .url {
        display: block;
        margin-top: var(--padding-base);
        width: calc(400px + var(--padding-base));
    }

    textarea {
        height: 80px;
        font-family: inherit;
    }
}
</style>