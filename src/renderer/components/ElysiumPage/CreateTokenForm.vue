<template>
    <div class="info-popup create-token-form">
        <div class="title">Create Token</div>

        <Form ref="form" as="div" class="content" :validation-schema="validationSchema" v-slot="{errors}">
            <div class="line">
                <Field
                    class="smooth-input"
                    type="text"
                    name="name"
                    placeholder="Name"
                    v-model="name"
                    v-tooltip="errors.name"
                    :validate-on-input="true"
                />

                <Field
                    class="smooth-input"
                    type="text"
                    name="ticker"
                    placeholder="Ticker"
                    v-model="ticker"
                    v-tooltip.right="errors.ticker"
                    :validate-on-input="true"
                />
            </div>

            <div class="line">
                <Field
                    class="smooth-input"
                    type="text"
                    placeholder="Category"
                    name="category"
                    v-model="category"
                />

                <Field
                    class="smooth-input"
                    type="text"
                    name="issuanceAmount"
                    placeholder="Issuance Amount"
                    :disabled="isManaged"
                    v-model="issuanceAmount"
                    v-tooltip.right="errors.issuanceAmount"
                    :validate-on-input="true"
                />
            </div>

            <div class="line">
                <div class="checkbox-container">
                    <div class="checkbox-field">
                        <input type="checkbox" v-model="isManaged">
                        <label>Enable Management</label>
                    </div>
                </div>

                <div class="checkbox-container">
                    <div class="checkbox-field">
                        <input type="checkbox" v-model="isDivisible">
                        <label>Allow Fractional Sends</label>
                    </div>
                </div>
            </div>

            <textarea name="description" class="smooth-input" placeholder="Description" v-model="description" />

            <Field
                class="url smooth-input"
                type="text"
                name="url"
                placeholder="URL"
                v-model="url"
                v-tooltip="errors.url"
                :validate-on-input="true"
            />
        </Form>

        <div class="buttons">
            <button class="solid-button unrecommended" @click="$emit('cancel')">Cancel</button>
            <button id="ok" class="solid-button recommended" @click="submit">OK</button>
        </div>
    </div>
</template>

<script>
import {Form, Field} from "vee-validate";

export default {
    name: "CreateTokenForm",

    components: {
        Form,
        Field
    },

    data() {
        return {
            name: '',
            ticker: '',
            category: '',
            subcategory: '',
            issuanceAmount: '',
            isManaged: false,
            isDivisible: true,
            description: '',
            url: ''
        };
    },

    watch: {
        isManaged() {
            if (this.isManaged) this.issuanceAmount = '';
        }
    },

    computed: {
        validationSchema() {
            [this.isManaged, this.isDivisible];

            return {
                name: (value) => !!(value.length) || 'You must specify a name for the token.',
                ticker: (value) => value != 'FIRO' && value.match(/^[A-Z]{3,4}$/) ? true : 'Ticker must be 3-4 capital letters, but not "FIRO"',
                issuanceAmount: (val) => {
                    const value = Number(val);
                    if (isNaN(value)) return 'Invalid number';
                    else if (this.isManaged && value) return 'Managed tokens may not have a starting value.';
                    else if (!this.isManaged && !value) return 'Non-managed tokens must have an issuance amount.';
                    else if (this.isManaged) return true;
                    else if (this.isDivisible && value < 0.00000002) return 'Divisible tokens must issue at least 0.00000002 units.';
                    else if (this.isDivisible && value > 92233720368) return 'Divisible tokens may issue no more than 92233720368 units.';
                    else if (!this.isDivisible && value < 2) return 'Indivisible tokens must issue at least 2 units.';
                    else if (!this.isDivisible && value > 9223372036854775807) return 'Indivisible tokens may issue no more than 9223372036854775807 units.';
                    else if (!this.isDivisible && value % 1 != 0) return 'Indivisible tokens must be issued in multiples of 1.';
                    else return true;
                },
                url: (value) => value.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/) || 'Invalid URL'
            };
        }
    },

    methods: {
        async submit() {
            if (!(await this.$refs.form.validate()).valid) return;

            const r = {name: `${this.name} (${this.ticker})`, isFixed: !this.isManaged};
            for (const p of ['category', 'subcategory', 'issuanceAmount', 'isDivisible', 'description', 'url']) {
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

            &[disabled] {
                background-color: var(--color-background-no-data);
            }
        }

        .checkbox-container {
            display: inline-block;
            width: 200px;
            vertical-align: middle;

            &:not(:last-child) {
                margin-right: var(--padding-base);
            }
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