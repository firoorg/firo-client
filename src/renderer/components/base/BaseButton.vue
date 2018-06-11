<template>
    <button
            v-bind="$attrs"
            :class="[color, { 'is-dark' : isDark, 'is-outline': isOutline, 'is-popover': isPopover }]"
            @click="$emit('click', $event.target.value)">
        <slot />
    </button>
</template>

<script>
    export default {
        name: 'BaseButton',
        inheritAttrs: false,
        props: {
            isOutline: {
                type: Boolean,
                required: false,
                default: false
            },

            isPopover: {
                type: Boolean,
                required: false,
                default: false
            },

            isDark: {
                type: Boolean,
                required: false,
                default: false
            },

            color: {
                type: String,
                required: false,
                default: ''
            }
        }
    }
</script>

<style lang="scss" scoped>
    $padding-v: 2;
    $padding-h: 4;

    button {
        padding: emRhythm($padding-v) emRhythm($padding-h);
        background: $color--white-light;
        cursor: pointer;
        color: $color--dark;
        border: 1px solid $color--dark;
        display: inline-block;
        // outline: none;

        @include font-heavy();
        @include box-shadow();

        transition: color 0.25s ease-in-out, background-color 0.25s ease-in-out, border-color 0.25s ease-in-out;

        &:hover,
        &:focus {
            background: $color--white;
        }

        &.is-outline {
            background-color: transparent;

            @include rhythmBorderTop(1px, $padding-v);
            @include rhythmBorderBottom(1px, $padding-v);

            &.red {
                color: $color--red;
                border-color: $color--red;

                &:hover,
                &:focus {
                    color: $color--red-bright;
                    border-color: $color--red-bright;
                }

                &.is-dark {
                    color: $color--white-light;

                    &:hover,
                    &:focus {
                        color: $color--white;
                    }
                }
            }

            &.is-dark {
                background-color: rgba($color--dark, 0.2);

                &:hover,
                &:focus {
                    background: rgba($color--dark, 0.4);
                }
            }
        }

        &.green {
            color: $color--white-light;
            background: $color--green;
            border-color: transparent;

            &:hover,
            &:focus {
                color: $color--white;
                background: $color--green-bright;

                &.is-popover {
                    box-shadow: inset 0 0 0 rgba($color--dark, 0.5);
                }
            }

            &.is-popover {
                box-shadow: inset 0 1px 2px rgba($color--dark, 0.5);
            }
        }

        &[disabled] {
            cursor: default;
        }
    }
</style>