<template>
    <div class="dropdown">
        <div class="pseudo-input-frame">
            <label class="pseudo-input-frame-label">{{ labelText }}</label>
            <VueSelect
                ref="vueSelect"
                :class="{select: true, disabled}"
                label="name"
                v-model="selectedOption"
                :clearable="false"
                :loading="loading"
                :disabled="disabled"
                :options="paginatedOptions"
                :placeholder="emptyText"
            >
                <template v-slot:option="option">
                    <div class="option">
                        <img v-if="option.icon" :src="option.icon" class="option-icon" />
                        <div class="name" :id="`option-${option.id}`">{{ option.name }}</div>
                    </div>
                </template>

                <template v-slot:selected-option="option">
                    <div class="option" v-if="option">
                        <img v-if="option.icon" :src="option.icon" class="option-icon" />
                        <div class="name" :id="`option-${option.id}`">{{ option.name }}</div>
                    </div>
                </template>

                <template #list-footer>
                    <li class="scroll">
                        <div :class="['scroll-arrow', canScrollUp ? 'enabled' : 'disabled']" @click="scrollUp">
                            ▲
                        </div>

                        <div :class="['scroll-arrow', canScrollDown ? 'enabled' : 'disabled']" @click="scrollDown">
                            ▼
                        </div>
                    </li>
                </template>

                <template #search="{attributes, events}">
                    <input maxlength="0" class="vs__search" v-bind="attributes" v-on="events"/>
                </template>
            </VueSelect>
        </div>
    </div>
</template>

<script>
import VueSelect from "vue-select";

export default {
    name: "Dropdown",

    /*
    interface Option {
        id: string; // What v-model will be set to
        name: string; // What will be displayed to the user
        icon?: string; // a URL for an icon associated with the option
    }
     */
    props: ['modelValue', 'options', 'labelText', 'emptyText', 'disabled', 'loading'],

    components: {
        VueSelect
    },

    data() {
        return {
            selectedOption: this.options.find(o => o.id === this.value),
            begin: 0,
            height: 10
        };
    },

    watch: {
        modelValue: {
            immediate: true,
            handler() {
                this.selectedOption = this.options.find(o => o.id === this.modelValue) || null;
                if (!this.selectedOption)
                    this.$nextTick(() => this.$refs.vueSelect.clearSelection());
            }
        },

        selectedOption() {
            this.$emit('update:modelValue', this.selectedOption?.id);
        }
    },

    computed: {
        paginatedOptions() {
            let selectedIndex = this.options.findIndex(o => o.id == this.selectedOption?.id);
            if (selectedIndex == -1) selectedIndex = 0;

            let begin = this.begin;
            let end = this.begin + this.height;

            if (end > this.options.length) {
                end = this.options.length;
                begin = end > this.height ? end - this.height : 0;
            }

            if (selectedIndex < begin || selectedIndex >= end) {
                end -= 1;
                return [this.options[selectedIndex], ...this.options.slice(begin, end)];
            } else {
                return this.options.slice(begin, end);
            }
        },

        canScrollUp() {
            return this.begin != 0;
        },

        canScrollDown() {
            return this.begin + this.height < this.options.length;
        }
    },

    methods: {
        scrollUp() {
            if (!this.canScrollUp) return;
            this.begin -= this.height;
        },

        scrollDown() {
            if (!this.canScrollDown) return;
            if (!this.canScrollDown) return;
            this.begin += this.height;
        }
    }
}
</script>

<style lang="scss">
$menu-padding: 6px;

.dropdown .pseudo-input-frame {
    position: relative;
    height: 50px;

    .pseudo-input-frame-label {
        z-index: var(--z-input-frame-label);
        position: absolute;
        top: -5px;
        left: 9px;
        font-size: 12px;
        letter-spacing: 0.4px;
        padding: {
            left: 5px;
            right: 5px;
        }
    }

    .v-select {
        &.disabled * {
            cursor: default !important;
        }

        &.vs--open {
            z-index: var(--z-dropdown);
        }

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

        i {
            background-color: inherit !important;

            &::before {
                border-color: var(--color-text-primary) !important;
            }
        }

        .vs__clear, .vs__dropdown-option--selected {
            display: none;
        }

        .vs__search {
            position: absolute;
            top: 0;
            left: 9px;
            border: none;
            box-shadow: none;
            outline: none;
            caret-color: rgba(0, 0, 0, 0);
            cursor: pointer;

            padding: {
                top: 11px;
                bottom: 11px;
                left: 6px;
                right: 6px;
            }
        }

        .vs__selected-options {
            float: left;
            color: inherit !important;
        }

        .vs__actions {
            margin-top: $menu-padding;
            float: right;

            .vs__spinner {
                display: none;
            }
        }

        &, input {
            font: {
                size: 13.3333px;
                weight: bold;
            }
        }

        .vs__dropdown-menu {
            cursor: pointer;
            background-color: var(--color-background-dropdown) !important;
            margin-left: calc(-2 * $menu-padding);
            padding: {
                bottom: $menu-padding;
                left: calc($menu-padding * 3);
                right: calc($menu-padding * 3);
            }
        }

        .vs__dropdown-toggle {
            color: var(--color-text-primary) !important;
            font-weight: bold;
            height: 100%;
            width: 100%;
            padding: $menu-padding;
            border: none;
            outline: none;

            input {
                background-color: inherit !important;
            }

            li {
                background-color: inherit !important;
            }

            a {
                color: var(--color-text-primary) !important;
            }
        }

        .option, .scroll {
            display: flex;

            font-weight: bold;

            padding: $menu-padding;

            .option-icon {
                height: 16px;
                width: 16px;

                margin: {
                    top: -1px;
                    right: $menu-padding;
                }
            }
        }

        .option {
            align-items: center;
        }

        .scroll {
            .scroll-arrow {
                text-align: center;
                width: 50%;

                &.disabled {
                    color: var(--color-text-disabled);
                    cursor: default;
                }
            }
        }
    }
}
</style>