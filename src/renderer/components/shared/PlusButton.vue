<template>
    <span><div class="plus-button" :class="{disabled: disabled}">+</div></span>
</template>

<script>
export default {
    name: "PlusButton",
    props: ['disabled']
}
</script>

<style scoped lang="scss">
.plus-button {
    width: 17px;
    height: 17px;
    margin: 0;

    display: table-cell;
    vertical-align: middle;
    text-align: center;

    color: var(--color-secondary);

    &.disabled {
        color: var(--color-text-disabled);
    }

    outline: none;
    border: {
        width: 1px;
        radius: 3px;
        style: solid;
        color: var(--color-secondary);
    }

    &.disabled {
        border-color: var(--color-text-disabled);
    }
}
</style>