<template>
    <div class="spinner" :class="[ color ]">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
    </div>
</template>

<script>
export default {
    name: 'LoadingBounce',

    props: {
        color: {
            type: String,
            default: null
        }
    }
}
</script>

<style lang="scss" scoped>
    $dim: 5;

    .spinner {
        width: emRhythm($dim);
        height: emRhythm($dim);

        position: relative;

        &.dark {
            .double-bounce1,
            .double-bounce2 {
                background-color: $color--polo-light;
            }
        }
    }

    .double-bounce1,
    .double-bounce2 {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: $color--dark;
        opacity: 0.8;
        position: absolute;
        top: 0;
        left: 0;

        animation: sk-bounce 2.0s infinite ease-in-out;
    }

    .double-bounce2 {
        animation-delay: -1.0s;
    }

    @keyframes sk-bounce {
        0%,
        100% {
            transform: scale(0.0);
            -webkit-transform: scale(0.0);
        }
        50% {
            transform: scale(1.0);
            -webkit-transform: scale(1.0);
        }
    }

</style>
