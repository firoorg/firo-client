<template>
    <button
            v-bind="$attrs"
            :class="[color, { 'is-dark' : isDark, 'is-outline': isOutline, 'is-popover': isPopover }]"
            @click="$emit('click', $event)">
        <span>
            <slot />
        </span>
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

        @include rhythmBorderTop(1px, $padding-v);
        @include rhythmBorderBottom(1px, $padding-v);

        @include font-heavy();

        transition: color 0.25s ease-in-out, background-color 0.25s ease-in-out, border-color 0.25s ease-in-out;

        &:hover,
        &:focus {
            background: $color--white;
        }

        .has-shadow {
            @include box-shadow();
        }

        &.is-outline {
            background-color: transparent;

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

        &.green,
        &.comet {
            position: relative;
            padding-top: emRhythm($padding-v);
            padding-bottom: emRhythm($padding-v);
            border: none;
            outline: none;

            // gradient
            &:before,
            &:after {
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                content: '';
                transition: opacity 0.25s ease-out;
                opacity: 0;
            }

            &:after {
                background: transparent;
            }

            &:not([disabled]) {
                &:hover,
                &:focus {
                    &:before {
                        opacity: 0.5;
                    }
                    &:after {
                        opacity: 1;
                    }

                    span {
                        color: $color--white;
                    }

                    &.is-popover {
                        box-shadow: 0 1px 2px rgba($color--dark, 0.5);
                    }
                }
            }

            &.is-popover {
                box-shadow: inset 0 1px 2px rgba($color--dark, 0.5);
            }

            span {
                position: relative;
                z-index: 2;
            }

            &.green {
                color: $color--white-light;
                background: $color--green;
                border-color: transparent;

                &:before {
                    background: $gradient--green-bright;
                }

                &:after {
                    @include glow-small-box($color--green, 0);
                }

                &[disabled] {
                    background: grayscale($color--green);
                }
            }

            &.comet {
                color: $color--white-light;
                background: $color--comet-dark;
                border-color: transparent;

                &:before {
                    background: $gradient--comet-dark-vertical;
                }

                &:after {
                    @include glow-small-box($color--comet-dark, 0);
                }

                &[disabled] {
                    background: grayscale($color--green);
                }
            }
        }

        &[disabled] {
            cursor: default;
        }
    }
</style>