<template>
    <section ref="console" class="log-console-page">
        <div class="log-console">{{ contents }}</div>
    </section>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "LogConsolePage",

    data() {
        return {
            contents: ''
        };
    },

    computed: {
        ...mapGetters({
            logMessages: 'App/logMessages'
        })
    },

    watch: {
        logMessages:{
            immediate: true,
            handler() {
                this.contents = this.logMessages.join("\n");
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
    white-space: pre;

    &:focus {
        outline: none;
    }

    .log-console {
        padding: var(--padding-base);
    }
}
</style>
