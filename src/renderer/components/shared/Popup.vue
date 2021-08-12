<template>
    <div id="popup">
        <div class="inner-popup">
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    name: "Popup",

    created() {
        document.getElementsByTagName('body')[0].classList.add('vue-tooltip-z-index-hack');
    },

    destroyed() {
        document.getElementsByTagName('body')[0].classList.remove('vue-tooltip-z-index-hack');
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/z";

#popup { // There can be only one.
    z-index: $z-popup;
    position: absolute;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    // Make #popup transparent. It will still steal clicks of all external elements.
    background-color: var(--color-popup-outside);

    display: flex;
    align-items: center;
    justify-content: center;

    .inner-popup {
        background-color: var(--color-background-popups);
        width: fit-content;
        height: fit-content;
        box-shadow: 0 8px 8px rgba(0, 0, 0, 0.25);
        border-radius: 8px;
    }
}
</style>