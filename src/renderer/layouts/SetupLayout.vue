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
.setup-layout {
    position: fixed;
    background-color: var(--color-background-detail);
    height: 100vh;
    width: 100vw;
    user-select: none;

    .logo {
        width: fit-content;
        margin: {
            left: auto;
            right: auto;
            top: var(--padding-base);
        };

        svg {
            height: 160px;
        }
    }

    .setup-child {
        background-color: var(--color-background-main);
        padding: var(--padding-base);
        border-radius: var(--padding-base);
        max-width: 90%;
        width: fit-content;
        margin: {
            top: var(--padding-base);
            left: auto;
            right: auto;
        };
        box-shadow: 0 2px 6px rgba(60, 57, 57, 0.08)
    }
}
</style>
