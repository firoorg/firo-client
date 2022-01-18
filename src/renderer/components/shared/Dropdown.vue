<template>
    <div class="dropdown">
        <div class="pseudo-input-frame">
            <label class="pseudo-input-frame-label">{{ labelText }}</label>
            <vue-select
                class="select"
                label="name"
                v-model="selectedOption"
                :loading="loading"
                :disabled="disabled"
                :options="options"
                :placeholder="emptyText"
            >
                <template v-slot:option="option">
                    <div class="option">
                        <img v-if="option.icon" :src="option.icon" class="option-icon" />
                        <div class="name">{{ option.name }}</div>
                    </div>
                </template>

                <template v-slot:selected-option="option">
                    <div class="option" v-if="option">
                        <img v-if="option.icon" :src="option.icon" class="option-icon" />
                        <div class="name">{{ option.name }}</div>
                    </div>
                </template>
            </vue-select>
        </div>
    </div>
</template>

<script>
import {VueSelect} from "vue-select";

export default {
    name: "Dropdown",

    /*
    interface Option {
        id: string; // What v-model will be set to
        name: string; // What will be displayed to the user
        icon?: string; // a URL for an icon associated with the option
    }
     */
    props: ['value', 'options', 'labelText', 'emptyText', 'disabled', 'loading'],

    components: {
        VueSelect
    },

    data() {
        return {
            selectedOption: this.options.find(o => o.id === this.value) || null
        };
    },

    watch: {
        selectedOption() {
            this.$emit('input', this.selectedOption.id);
        }
    }
}
</script>

<style lang="scss">
.dropdown .pseudo-input-frame {
    position: relative;
    height: 50px;

    .pseudo-input-frame-label {
        position: absolute;
        left: 9px;
        font-size: 12px;
        letter-spacing: 0.4px;
        background-color: var(--color-background-sidebar);
        z-index: var(--z-input-frame-label);
        padding: {
            left: 5px;
            right: 5px;
        }
    }

    .v-select {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;

        height: 36px;

        border: {
            width: thin;
            style: solid;
            radius: 4px;
            color: var(--color-secondary-tag-background);
        }

        button.clear {
            display: none;
        }

        &, input {
            font: {
                size: 13.3333px;
                weight: bold;
            }
        }

        .dropdown-menu > .highlight > a {
            background: var(--color-secondary-tag-background);
        }

        .dropdown-toggle {
            font-weight: bold;
            height: 100%;
            width: 100%;
            padding: {
                top: 6px;
                bottom: 6px;
                left: 6px;
                right: 6px;
            }
            background-color: inherit;
            border: none;
            outline: none;
        }

        .option {
            display: flex;
            align-items: center;
            font-weight: bold;

            .option-icon {
                height: 16px;
                width: 16px;

                margin: {
                    top: -1px;
                    right: 6px;
                }
            }
        }
    }
}
</style>