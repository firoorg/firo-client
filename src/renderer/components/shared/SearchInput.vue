<template>
    <div class="search-input">
        <div class="search-icon">🔍</div>
        <input
            type="text"
            v-model="searchValue"
            :placeholder="placeholder"
            spellcheck="false"
            @input="!lazy && $emit('update:modelValue', $event.target.value)"
            @change="lazy && $emit('update:modelValue', $event.target.value)"
        >
    </div>
</template>

<script>
export default {
    name: "SearchInput",

    props: ['modelValue', 'placeholder', 'lazy'],

    data() {
        return {
            searchValue: this.modelValue
        };
    }
}
</script>

<style scoped lang="scss">
.search-input {
    position: relative;
    width: 100%;
    height: 40px;

    .search-icon {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1;
        padding: {
            top: 10px;
            bottom: 10px;
            left: 15px;
        }
        font-size: 20px;
    }

    input {
        position: absolute;
        top: 0;
        left: 0;

        width: 100%;
        height: 40px;

        padding: {
            top: 10px;
            bottom: 10px;
            left: 40px;
            right: 20px;
        }

        color: var(--color-text-primary);
        background: var(--color-background-sidebar);

        outline: none;

        @at-root #app.light-color-scheme &, & {
            border: {
                color: var(--color-text-subtle-border);
                radius: 20px;
            }
        }

        @at-root #app.dark-color-scheme & {
            border: none;
        }

        @media(prefers-color-scheme: dark) {
            border: none;
        }
    }
}
</style>