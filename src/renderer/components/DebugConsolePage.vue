<template>
    <section
        ref="debugPage"
        class="debug-page"
        tabindex="0"
        @keypress="focusInput"
        @mouseup="focusInputUnlessTextIsSelected"
    >
        <div class="console">
            <div class="output">
                <div class="info">
                    Hello, welcome to the Firo Client debug console. Here you can interact with firod directly. Write
                    <b>help</b> and see the list of commands, or <b>clear</b> to clear the console. Please be aware that
                    some commands may cause the client state to become corrupted. If this happens, restarting the client
                    will fix the issue.
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
                    id="current-input"
                    class="input"
                    spellcheck="false"
                    contenteditable="true"
                    @keydown="onInput"
                    @keyup="updateSuggestions"
                    @paste="onPaste"
                >
                </div>
            </div>

            <div class="suggestions">
                <span
                    v-for="suggestion of suggestions"
                    :key="suggestion"
                    class="suggestion"
                    :class="{selected: suggestions[suggestionTabIndex] === suggestion}"
                >
                    {{ suggestion }}
                </span>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: "DebugConsolePage",

    data () {
        return {
            // This is the transcript of our console session that will be shown to the user. Unlike this.history, it
            // will be cleared if the user clears the console.
            //
            // {input: string, output: string}[]
            sessionLog: [],

            // This is a history of entered commands. It will not be erased when the user clears the console.
            history: [],

            // On start or immediately after the user has entered a command, historyIndex will be set to 0 and will
            // refer to temporaryBuffer. The user may use the up or down arrows on their keyboard to increase or
            // decrease historyIndex respectively. Navigating to a non-zero historyIndex will cause the corresponding
            // entry (counted backwards from 1) of this.history to be loaded into currentInput. Edits made by the user
            // to currentInput will not be saved back into this.history.
            historyIndex: 0,

            // temporaryBuffer is a temporary input buffer referenced by historyIndex 0. Unlike other items in history,
            // edits made to it will be persistent when navigating away from and back to it, however it will be cleared
            // when a command is sent (even if it is not sent while historyIndex 0 is active.
            temporaryBuffer: '',

            // A list of all available commands. Will be filled in when mounted.
            availableCommands: [],

            // The list of suggestions relevant to the current input.
            suggestions: [],

            // Which suggestion is currently active. This is -1 before the user tabs to the next suggestion.
            suggestionTabIndex: -1,

            // Extra help to display to the user in addition to RPC help.
            clientCommands: {
                clear: {
                    shortHelp: 'clear',
                    longHelp: 'Clear the console.',
                    cmd: () => this.clear()
                },

                resetclientconfig: {
                    shortHelp: 'resetclientconfig',
                    longHelp: 'Reset the configuration of the client, allowing you to go through setup again.',
                    cmd: async () => await this.resetclientconfig()
                },

                help: {
                    shortHelp: 'help [command]',
                    longHelp: 'List all commands, or get help for a specified command.',
                    cmd: async (commandline) => await this.help(commandline)
                },

                setargsfornextrun: {
                    shortHelp: 'setargsfornextrun [...args]',
                    longHelp: 'Set arguments to be passed to firod on the next run.',
                    cmd: async (commandline)  => await this.setargsfornextrun(commandline)
                }
            }
        }
    },

    async mounted () {
        // This is needed when we're reloading the page.
        while (!window.$daemon) {
            await new Promise(r => setTimeout(r, 10));
        }

        const sort_dedup = array => array.sort().reduce((a, x) => {if (a[a.length-1] !== x) {a.push(x)} return a}, []);

        // Get the list of available commands.
        const commands = await $daemon.legacyRpcCommands();
        this.availableCommands = sort_dedup(commands.concat(Object.keys(this.clientCommands)));
    },

    async activated() {
        this.scrollToBottom();
        this.moveCursorToEndOfInput();
    },

    methods: {
        clear() {
            this.sessionLog = [];
        },

        async help(commandline) {
            if (this.clientCommands[commandline]) {
                return this.clientCommands[commandline].longHelp;
            } else if (commandline) {
                return await this.legacyRpc(`help ${commandline}`);
            } else {
                let output = await this.legacyRpc("help");
                output += "\n\n== GUI ==\n";
                output += Object.values(this.clientCommands)
                    .map(c => c.shortHelp)
                    .sort()
                    .join("\n");
                return output;
            }
        },

        // Update the suggestions to show the user. This can't be made as a computed property because this.$refs is not
        // reactive.
        updateSuggestions (event=null) {
            if (event && event.keyCode === 9) {
                return;
            }

            this.suggestionTabIndex = -1;

            const input = this.$refs.currentInput && this.$refs.currentInput.innerText;
            if (input) {
                this.suggestions = this.availableCommands.filter(cmd => cmd.indexOf(input) === 0);
            } else {
                // Don't show completions if the user hasn't typed anything yet.
                this.suggestions = [];
            }

            // Make sure suggestions are visible.
            this.$nextTick(() =>
                this.scrollToBottom()
            );
        },

        // Move the user to the next suggestion.
        onTab () {
            if (!this.suggestions.length) {
                return;
            }

            this.suggestionTabIndex = (this.suggestionTabIndex + 1) % this.suggestions.length;
            this.$refs.currentInput.innerText = this.suggestions[this.suggestionTabIndex];

            this.$nextTick(() =>
                this.moveCursorToEndOfInput()
            );
        },

        // Clear the input.
        onCtrlC () {
            this.historyIndex = 0;
            this.temporaryBuffer = '';
            this.$refs.currentInput.innerText = '';
            this.updateSuggestions();

            this.$nextTick(() =>
                this.scrollToBottom()
            );
        },

        focusInputUnlessTextIsSelected() {
            // FIXME: We will fail to fire if the current click is one that removes a selection.
            if (!document.getSelection().toString()) {
                this.focusInput();
            }
        },

        focusInput() {
            this.$refs.currentInput.focus();
        },

        scrollToBottom() {
            this.$refs.debugPage.scrollTop = this.$refs.debugPage.scrollHeight;
            this.$refs.debugPage.scrollLeft = 0;
        },

        moveCursorToEndOfInput() {
            this.focusInput();

            const range = document.createRange();
            range.selectNodeContents(document.querySelector("#current-input"));
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            window.getSelection().collapseToEnd();
        },

        onInput(event) {
            switch (event.keyCode) {
            case 9:
                event.preventDefault();
                this.onTab();
                break;

            case 38:
                event.preventDefault();
                this.onUpArrow();
                break;

            case 40:
                event.preventDefault();
                this.onDownArrow();
                break;

            case 13:
                event.preventDefault();
                this.onEnter();
                break;

            case 67:
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.onCtrlC();
                }

                break
            }
        },

        onUpArrow() {
            if (this.historyIndex === 0) {
                this.temporaryBuffer = this.$refs.currentInput.innerText;
            }

            if (this.history.length < this.historyIndex + 1) {
                // The user is trying to move upwards in history when they're already at the beginning.
                return;
            }

            this.historyIndex += 1;
            this.$refs.currentInput.innerText = this.history[this.history.length -  this.historyIndex];

            this.$nextTick(() => this.moveCursorToEndOfInput());
        },

        onDownArrow() {
            if (this.historyIndex ===  0) {
                // The user is trying to move downwards in history when they're already at the end.
                return;
            }

            this.historyIndex -= 1;

            if (this.historyIndex === 0) {
                this.$refs.currentInput.innerText = this.temporaryBuffer;
            } else {
                this.$refs.currentInput.innerText = this.history[this.history.length - this.historyIndex];
            }

            this.$nextTick(() => this.moveCursorToEndOfInput());
        },

        async onEnter() {
            let input = this.$refs.currentInput.innerText;

            // For some reason I'm not exactly sure of, spaces in the input are sometimes non-breaking (\xa0) instead of
            // breaking (\x20).
            input = input.replace(/\xa0/g, ' ');

            // Prevent the user from making changes to the command or hitting enter again while we're loading the result
            // of a command.
            this.$refs.currentInput.contentEditable = false;

            this.history.push(input);

            const m = input.match(/^\s*(\w+)\s*(.*)$/);

            let output;
            if (m && this.clientCommands[m[1]]) {
                output = await this.clientCommands[m[1]].cmd(m[2]);
            } else {
                try {
                    output = await this.legacyRpc(input);
                } catch(e) {
                    output = `${e}`;
                }
            }

            if (output === '' || output) {
                this.sessionLog.push({input, output});
            }

            this.$refs.currentInput.contentEditable = true;
            this.$refs.currentInput.innerText = '';
            this.temporaryBuffer = '';
            this.historyIndex = 0;

            this.$nextTick(() => {
                this.focusInput();
                this.updateSuggestions();
            });
        },

        onPaste(event) {
            event.preventDefault();

            const clipboardData = event.clipboardData.getData('text/plain');
            // DOMParser does not execute script tags or load images.
            const node = new DOMParser().parseFromString(clipboardData, 'text/html');
            const clipboardText = (node.body.textContent || '').replace(/\s/g, ' ');

            const selection = document.getSelection();
            const selectionRange = selection.getRangeAt(0);
            let startOffset = selectionRange.startOffset;
            let endOffset = selectionRange.endOffset

            // Insert text at cursor.
            let text = '';
            const el = this.$refs.currentInput;
            text += el.textContent.slice(0, startOffset);
            text += clipboardText;
            text += el.textContent.slice(endOffset);
            el.innerText = text;

            const newOffset = startOffset + clipboardText.length;
            selectionRange.setStart(el.firstChild, newOffset);
            selectionRange.setEnd(el.firstChild, newOffset);
        },

        async legacyRpc(commandline) {
            const response = await $daemon.legacyRpc(commandline);

            if (response.result) {
                return response.result;
            } else if (response.error) {
                return response.error.message;
            } else if (!response.id) {
                return '';
            } else {
                return response;
            }
        },

        async resetclientconfig() {
            await this.$store.dispatch('App/setIsInitialized', false);
            this.$nextTick($quitApp);
        },

        async setargsfornextrun(commandline) {
            await this.$store.dispatch('App/setTemporaryFirodArguments', commandline.split(' '));
            return '';
        }
    }
}
</script>

<style scoped lang="scss">
.debug-page {
    overflow: scroll;
    user-select: text;
    height: 100%;
    word-break: break-all;
    font-family: "Robot Mono", monospace;

    &:focus {
        outline: none;
    }

    .console {
        padding: var(--padding-base);

        .input-line {
            font-weight: bold;

            .prompt, .input {
                display: inline;
            }
        }

        .output {
            .info {
                margin-bottom: 6px;

                word-break: normal;

                .bold {
                    font-weight: bold;
                }
            }

            .input {
                font-weight: bold;
            }

            .output {
                white-space: pre-wrap;
                margin-bottom: 6px;
            }
        }

        .current-input-line {
            .prompt {
                user-select: none;
                vertical-align: middle;
            }

            .input {
                vertical-align: middle;
                outline: none;
            }
        }

        .suggestions {
            margin-top: 6px;
            word-break: break-word;

            .suggestion {
                color: var(--color-text-disabled);

                &:not(:last-child) {
                    margin-right: 8px;
                }

                &.selected {
                    color: var(--color-text-secondary);
                    font-weight: bold;
                }
            }
        }
    }
}
</style>
