<template>
    <div class="setup-layout">
        <div class="logo">
            <FiroLogoDark />
        </div>

        <router-view class="setup-child" />
    </div>
</template>

<script>
import FiroLogoDark from "renderer/assets/FiroLogoDark.svg";

export default {
    name: "SetupLayout",

    components: {
        FiroLogoDark
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/sizes";

.setup-layout {
    position: fixed;
    background-color: $color-setup-background;
    height: 100vh;
    width: 100vw;

    .logo {
        width: fit-content;
        margin: {
            left: auto;
            right: auto;
            top: $size-large-space;
        };

        svg {
            height: $size-setup-logo-height;
        }
    }

    .setup-child {
        background-color: $color-setup-foreground;
        padding: $size-small-space;
        border-radius: $size-small-space;
        max-width: 90%;
        width: fit-content;
        margin: {
            top: $size-large-space;
            left: auto;
            right: auto;
        };
    }
}
</style>
