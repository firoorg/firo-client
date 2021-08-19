<template>
    <div class="waiting-screen">
        <div class="inner">
            <div class="header-text">
                Just a Moment...
            </div>

            <FiroSymbolWhite />

            <div class="dotdotdot">
                <div />
                <div />
                <div />
            </div>

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
@import "src/renderer/styles/z";

$speed: 2.5s;

.waiting-screen {
    position: fixed;
    height: 100vh;
    width: 100vw;
    z-index: $z-waiting-screen;
    text-align: center;
    background-color: var(--color-background-detail);

    .inner {
        // Center .inner horizontally and vertically.
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        svg {
            width: 80px;
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

        .dotdotdot {
            @keyframes blink {
                0% {background-color: var(--color-primary);}
                15% {background-color: var(--color-primary-button-disabled);}
                65% {background-color: var(--color-primary-button-disabled);}
                66% {background-color: var(--color-primary);}
                100% {background-color: var(--color-primary);}
            }

            div {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 5px;
                animation: blink 4.5s infinite;
                background-color: var(--color-primary-button-disabled);

                &:nth-child(1) { animation-delay: -3s; }
                &:nth-child(2) { animation-delay: -1.5s; }
            }
        }

        .reason {
            margin-top: var(--padding-popup);
        }
    }
}
</style>
