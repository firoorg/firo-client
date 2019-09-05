<template>
    <section
        v-scrollable
        ref="debugPage"
        class="debug-page"
        tabindex="0"
        @keypress="focusInput"
        @mouseup="focusInputUnlessTextIsSelected"
    >
        <div class="console">
            <div class="output">
                <div class="info">
                    Hello, welcome to the Zcoin Client debug console. Here you can interact with zcoind directly. Write
                    <span class="bold">help</span> and see the list of commands, or <span class="bold">clear</span> to
                    clear the console.
                </div>

                <div
                    v-for="{input, output} of sessionLog"
                >
                    <div class="input-line">
                        <div class="prompt">
                            >
                        </div>

                        <div class="input">
                            {{ input }}
                        </div>
                    </div>

                    <div class="output">{{ output }}</div>
                </div>
            </div>

            <div class="input-line current-input-line">
                <div class="prompt">
                    >
                </div>

                <div
                    ref="currentInput"
                    class="input"
                    contenteditable="true"
                    @keydown.enter.prevent="onInput"
                >
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: "DebugPage",

    data () {
        return {
            // This is a transcript of our console session.
            //
            // {input: string, output: string}[]
            sessionLog: []
        }
    },

    mounted () {
        this.focusInput();
    },

    methods: {
        focusInputUnlessTextIsSelected() {
            // FIXME: We will fail to fire if the current click is one that removes a selection.
            if (!document.getSelection().toString()) {
                this.focusInput();
            }
        },

        focusInput() {
            this.$refs.currentInput.focus();
        },

        async onInput() {
            const input = this.$refs.currentInput.innerText;

            // Prevent the user from making changes to the command or hitting enter again while we're loading the result
            // of a command.
            this.$refs.currentInput.contentEditable = false;

            if (input === 'clear') {
                this.sessionLog = [];
            } else {
                this.sessionLog.push({
                    input,
                    output: await this.legacyRpc(input)
                });
            }

            this.$refs.currentInput.contentEditable = true;
            this.$refs.currentInput.innerText = '';

            // Scroll to bottom. It has to be on $nextTick because we need to wait for sessionLog to update.
            this.$nextTick(() => {
                this.focusInput();
                this.$refs.debugPage.scrollTop = this.$refs.debugPage.scrollHeight;
                this.$refs.debugPage.scrollLeft = 0;
            });
        },

        async legacyRpc(commandline) {
            const response = await this.$daemon.legacyRpc(commandline);

            if (response.result) {
                return response.result;
            } else if (response.error) {
                return response.error.message;
            } else if (!response.id) {
                return '';
            } else {
                return response;
            }
        }
    }
}
</script>

<style scoped lang="scss">
.debug-page {
    // override styles defined globally
    padding-right: 0;

    word-break: break-all;

    background-color: $color--dark;
    color: $color--green;

    .console {
        font: {
            family: monospace;
            size: 1.3em;
        }

        padding: {
            top: 4em;
            left: 2%;
            right: 2%;
        }

        .input-line {
            font-weight: bold;

            .prompt, .input {
                display: inline;
            }

            .input {
                margin-left: 0.5em;
                max-width: border-box;
            }
        }

        .output {
            .info {
                font-style: italic;
                margin-bottom: 2em;

                word-break: normal;

                .bold {
                    font-weight: bold;
                }
            }

            .input {
                font-weight: bold;
            }

            .output {
                white-space: pre-line;
                margin-bottom: 1em;
            }
        }

        .current-input-line {
            .prompt {
                user-select: none;
            }

            .input {
                outline: none;
            }
        }
    }
}
</style>