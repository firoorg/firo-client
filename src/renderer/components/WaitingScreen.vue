<template>
    <div class="waiting-screen">
        <div class="top">
            <FiroSymbol />

            <DotDotDot />

            <div class="reason">
                {{ reason }}
            </div>
        </div>

        <div ref="log" class="log">
            <div v-for="(msg, i) in logMessages" class="message" :key="i">
                {{ msg }}
            </div>
        </div>
    </div>
</template>

<script>
import {mapGetters} from "vuex";
import FiroSymbol from "renderer/assets/FiroSymbol.vue";
import DotDotDot from "renderer/components/shared/DotDotDot.vue";

export default {
    name: "WaitingScreen",

    components: {
        DotDotDot,
        FiroSymbol
    },

    props: {
        reason: {
            type: String,
            required: true
        }
    },

    watch: {
        logMessages: {
            immediate: true,
            handler() {
                this.$nextTick(() => {
                    this.$refs.log.scrollTop = this.$refs.log.scrollHeight;
                    this.$refs.log.scrollLeft = 0;
                })
            }
        }
    },

    computed: {
        ...mapGetters({
            logMessages: 'App/logMessages'
        })
    }
}
</script>

<style lang="scss">
$speed: 2.5s;

.waiting-screen {
    position: fixed;
    height: 100vh;
    width: 100vw;
    z-index: var(--z-waiting-screen);
    background-color: var(--color-background-detail);

    display: flex;
    flex-direction: column;

    .top {
        text-align: center;

        margin: {
            top: 10vh;
            left: auto;
            right: auto;
        };

        .firo-symbol-svg {
            width: 80px;
            margin: {
                bottom: var(--padding-base);
                left: auto;
                right: auto;
            }
        }

        .reason {
            margin-top: var(--padding-base);
            opacity: 0.7;
        }
    }

    .log {
        flex-grow: 1;
        width: 80vw;
        margin: {
            top: 10vh;
            bottom: 10vh;
            left: auto;
            right: auto;
        }
        text-align: left;
        opacity: 0.5;
        font-family: "Robot Mono", monospace;
        overflow: scroll;
    }
}
</style>
