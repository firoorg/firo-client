<template>
    <div
        class="spinner"
        :class="[ color, size ]"
    >
        <div class="double-bounce1" />
        <div class="double-bounce2" />
    </div>
</template>

<script>
export default {
    name: 'LoadingBounce',

    props: {
        color: {
            type: String,
            default: "comet"
        },
        size: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="scss" scoped>
    .spinner {
        width: 2.5em;
        height: 2.5em;

        position: relative;

        &.dark {
            .double-bounce1,
            .double-bounce2 {
                background-color: #F5F7FF;
            }
        }

        &.green {
            .double-bounce1,
            .double-bounce2 {
                background-color: #23B852;
            }
        }

        &.comet {
            .double-bounce1,
            .double-bounce2 {
                background-color: #52527A;
            }
        }

        &.small {
            width: 0.833em;
            height: 0.833em;
        }

        &.mini {
            margin-bottom: -.16em;
            width: 1em;
            height: 1em;
        }
    }

    .double-bounce1,
    .double-bounce2 {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #1F1F2E;
        opacity: 0.8;
        position: absolute;
        top: 0;
        left: 0;

        animation: sk-bounce 2.0s infinite ease-in-out;
    }

    .double-bounce2 {
        animation-delay: -1.0s;
        opacity: 0.4;
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
