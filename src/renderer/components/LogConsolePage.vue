<template>
    <section ref="console" class="log-console-page">
        <div class="log-console">
            <div v-for="(msg, i) in logMessages" class="message" :key="i">
                {{ msg }}
            </div>
        </div>
    </section>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "LogConsolePage",

    computed: {
        ...mapGetters({
            logMessages: 'App/logMessages'
        })
    },

    watch: {
        logMessages:{
            immediate: true,
            handler() {
                if (!this.$refs.console || this.$refs.console.scrollTop + this.$refs.console.clientHeight >= this.$refs.console.scrollHeight) {
                    this.$nextTick(() => this.scrollToBottom());
                }
            }
        }
    },

    methods: {
        scrollToBottom() {
            this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
            this.$refs.console.scrollLeft = 0;
        }
    }
}
</script>

<style scoped lang="scss">
.log-console-page {
    overflow: scroll;
    user-select: text;
    height: 100%;
    word-break: break-all;
    font-family: "Robot Mono", monospace;

    &:focus {
        outline: none;
    }

    .log-console {
        padding: var(--padding-base);
    }
}
</style>
