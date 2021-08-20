<template>
    <div class="wait-overlay">
        <div class="inner">
            <div class="logo">
                <FiroSymbolWhite />
            </div>

            <DotDotDot />
        </div>
    </div>
</template>

<script>
import FiroSymbolWhite from "renderer/assets/FiroSymbolWhite.svg";
import DotDotDot from "renderer/components/shared/DotDotDot";

export default {
    name: "WaitOverlay",
    components: {
        FiroSymbolWhite,
        DotDotDot
    }
}
</script>

<style scoped lang="scss">
.wait-overlay {
    height: 120px;
    width: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .inner {
        height: fit-content;
    }

    .logo {
        width: fit-content;
        margin: auto;

        svg {
            width: 50px;
            margin: {
                top: var(--padding-popup);
                bottom: var(--padding-popup);
                left: auto;
                right: auto;
            }

            g {
                fill: var(--color-primary);
            }
        }
    }
}
</style>