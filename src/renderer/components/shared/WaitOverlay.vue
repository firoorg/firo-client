<template>
    <div class="wait-overlay">
        <div class="inner">
            <div class="logo">
                <FiroSymbol />
            </div>

            <DotDotDot />
        </div>
    </div>
</template>

<script>
import FiroSymbol from "renderer/assets/FiroSymbol";
import DotDotDot from "renderer/components/shared/DotDotDot";

export default {
    name: "WaitOverlay",

    components: {
        DotDotDot,
        FiroSymbol
    }
}
</script>

<style lang="scss">
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

        .firo-symbol-svg {
            width: 50px;
            margin: {
                top: var(--padding-base);
                bottom: var(--padding-base);
                left: auto;
                right: auto;
            }
        }
    }
}
</style>