<template>
    <div>
        <h2>
            <slot />
        </h2>
        <div class="edit-actions">
            <base-popover
                :open.sync="isOpen"
                placement="left"
                :auto-hide="true"
                popover-class="notice"
                @apply-show="focusInput"
            >
                <template slot="content">
                    <div>
                        <label>
                            <div>Change Label</div>
                            <input
                                ref="input"
                                v-model="content"
                                type="text"
                                autofocus
                            >
                        </label>
                        <footer>
                            <base-button
                                size="small"
                                is-dark
                                is-outline
                            >
                                Discard
                            </base-button>
                            <base-button
                                size="small"
                                color="green"
                                is-dark
                            >
                                Update
                            </base-button>
                        </footer>
                    </div>
                </template>

                <template slot="target">
                    <base-round-button
                        color="light"
                        size="large"
                        :is-active="isOpen"
                    >
                        <tick-icon color="white" />
                    </base-round-button>
                </template>
            </base-popover>
        </div>
    </div>
</template>

<script>
import TickIcon from '@/components/Icons/TickIcon'
import BasePopover from "../../base/BasePopover";

export default {
    name: 'EditableLabel',
    components: {
        BasePopover,
        TickIcon
    },
    props: {
        label: {
            type: String,
            default: ''
        }
    },

    data () {
        return {
            isOpen: false,
            content: this.label || ''
        }
    },

    methods: {
        focusInput () {
            console.log('hoohohoho huu')
            this.$nextTick(() => {
                this.$refs.input.focus()
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    div {
        //display: flex;
        position: relative;

        h2 {
            max-width: 90%;
            border: 1px solid red;
        }
    }

    .edit-actions {
        position: absolute;
        right: 0;
        //top: emRhythm(1);
        top: 0;
    }

    input {
        @include dark-input()
    }
</style>
