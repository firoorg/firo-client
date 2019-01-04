<template>
    <form
        class="form"
        @submit.prevent="submitForm"
    >
        <div class="field">
            <label for="editable-input">
                Change Label
            </label>
            <div class="control">
                <input
                    id="editable-input"
                    ref="input"
                    v-model="content"
                    type="text"
                >
            </div>
        </div>
        <footer>
            <base-button
                v-close-popover
                size="small"
                type="button"
                is-dark
                is-outline
            >
                Discard
            </base-button>
            <base-button
                size="small"
                color="green"
                is-dark
                :disabled="!hasChangedLabel"
            >
                Update
            </base-button>
        </footer>
    </form>
</template>

<script>
export default {
    name: 'EditableLabelPopoverContent',

    props: {
        label: {
            type: String,
            default: ''
        },

        resetLabelAndSelectInput: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            content: this.label || ''
        }
    },

    computed: {
        hasChangedLabel () {
            return this.label !== this.content
        }
    },

    watch: {
        resetLabelAndSelectInput: {
            handler (newVal, oldVal) {
                if (newVal && !oldVal) {
                    setTimeout(() => {
                        this.content = this.label
                        this.$refs.input.select()
                    }, 50)
                }
            },
            immediate: true
        }
    },

    methods: {
        submitForm () {
            this.$emit('submit', {
                label: this.content
            })
        }
    }
}
</script>

<style lang="scss" scoped>

.form .field {
    margin-bottom: 0;
}

.form .field .control input {
    @include dark-input();
    width: 17rem;
}
</style>
