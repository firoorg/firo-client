<template>
    <div class="waiting-screen">
        <div class="inner">
            <h2 class="header-text">
                Just a Moment...
            </h2>

            <FiroSymbolWhite />

            <div class="reason">
                {{ reason }}
            </div>
        </div>
    </div>
</template>

<script>
import FiroSymbolWhite from "renderer/assets/FiroSymbolWhite.svg";

export default {
    name: "WaitingScreen",

    components: {
        FiroSymbolWhite
    },

    created() {
        document.getElementsByTagName('body')[0].classList.add('vue-tooltip-z-index-hack');
    },

    destroyed() {
        document.getElementsByTagName('body')[0].classList.remove('vue-tooltip-z-index-hack');
    },

    props: {
        reason: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/colors";
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/z";

.waiting-screen {
    position: fixed;
    height: 100vh;
    width: 100vw;
    z-index: $z-waiting-screen;
    text-align: center;
    background-color: $color-loading-background;

    .inner {
        // Center .inner horizontally and vertically.
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        svg {
            width: 20vw;
            margin: {
                top: $size-medium-space;
                bottom: $size-medium-space;
                left: auto;
                right: auto;
            }
        }

        .reason {
            color: $color-text-accent;
            font-style: italic;
        }
    }
}
</style>
