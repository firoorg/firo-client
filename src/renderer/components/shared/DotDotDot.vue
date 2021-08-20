<template>
    <div class="dotdotdot">
        <div />
        <div />
        <div />
    </div>
</template>

<script>
export default {
    name: "DotDotDot"
}
</script>

<style scoped lang="scss">
.dotdotdot {
    width: fit-content;
    margin: auto;

    @keyframes blink {
        0% {
            background-color: var(--color-primary);
        }
        15% {
            background-color: var(--color-primary-button-disabled);
        }
        65% {
            background-color: var(--color-primary-button-disabled);
        }
        66% {
            background-color: var(--color-primary);
        }
        100% {
            background-color: var(--color-primary);
        }
    }

    div {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 5px;
        animation: blink 4.5s infinite;
        background-color: var(--color-primary-button-disabled);

        &:nth-child(1) {
            animation-delay: -3s;
        }

        &:nth-child(2) {
            animation-delay: -1.5s;
        }
    }
}
</style>