<template>
    <button
        v-bind="$attrs"
        :class="[{ 'is-light' : isLight }]"
        @click="$emit('click', $event)"
    >
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
        isLight: {
            type: Boolean,
            required: false,
            default: false
        }
    }
}
</script>

<style lang="scss" scoped>
    $padding-v: 1;
    $padding-h: 2;

    button {
        position: relative;
        padding: emRhythm($padding-v) emRhythm($padding-h);
        // background: $color--polo-medium;
        background: transparent;
        cursor: pointer;
        color: $color--comet-dark-mixed;
        //border: none;
        border: 1px solid $color--polo-medium;
        display: inline-block;
        // outline: none;

        @include rhythmBorderTop(1px, $padding-v);
        @include rhythmBorderBottom(1px, $padding-v);

        transition: color 0.25s ease-in-out, background-color 0.25s ease-in-out, border-color 0.25s ease-in-out;
        outline: none;


        &:hover,
        &:focus {
            background: $color--polo-medium;
            border-color: $color--polo;
            color: $color--dark;

            span {
                opacity: 1;
            }
        }


        span {
            opacity: 0.85;
            transition: opacity 0.25s ease-in-out;
        }

        /*
        .has-shadow {
            @include box-shadow();
        }

        &.is-outline {
            background-color: transparent;
            border-color: rgba($color--dark, 0.5);

            span {
                opacity: 0.7;
            }

            &:after {
                @include glow-small-box($color--polo, 0);
                //opacity: 1;
            }

            &[disabled] {
                opacity: 0.66;
            }

            &:not([disabled]) {
                &:hover,
                &:focus {
                    // color: $color--red-bright;
                    border-color: $color--dark;
                    background-color: $color--white-light;

                    &:after,
                    span {
                        opacity: 1;
                    }
                }
            }

            &.is-dark {
                background-color: rgba($color--dark, 0.2);
                color: $color--white-light;
                border-color: $color--white-light;
                outline: none;

                &:hover,
                &:focus {
                    background: rgba($color--dark, 0.4);
                    border-color: $color--white;
                    color: $color--white;
                }
            }

            &.red {
                color: $color--red-bright;
                border-color: $color--red;

                &:after {
                    @include glow-small-box($color--red, 0);
                }

                &:hover,
                &:focus {
                    color: $color--red-bright;
                    border-color: $color--red-bright;
                }
            }

            &.orange {
                color: $color--orange;
                border-color: $color--orange;

                &:after {
                    @include glow-small-box($color--orange, 0);
                }

                &:hover,
                &:focus {
                    color: $color--orange-bright;
                    border-color: $color--orange-bright;
                }
            }
        }

        &.green,
        &.orange,
        &.red,
        &.comet {
            &:not(.is-outline) {
                //padding-top: emRhythm($padding-v);
                //padding-bottom: emRhythm($padding-v);
                //border: none;
                outline: none;
                color: $color--white-light;

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
                            opacity: 1;
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
                    background: $color--green;
                    border-color: transparent;

                    &:before {
                        background: $gradient--green-bright;
                    }

                    &:after {
                        @include glow-small-box($color--green, 0);
                    }

                    &[disabled] {
                        background: rgba(mix($color--green, $color--dark, 40%), 0.25);
                        border-color: $color--green;
                        color: $color--white;

                        span {
                            opacity: 1;
                        }

                        &.is-dark {
                            color: mix($color--green-dark, $color--dark, 15%);
                            background: rgba(mix($color--green, $color--dark), 0.2);
                            border-color: mix($color--green-dark, $color--dark);
                        }
                    }
                }

                &.comet {
                    background: $color--comet-dark;
                    border-color: transparent;

                    &:before {
                        background: $gradient--comet-dark-vertical;
                    }

                    &:after {
                        @include glow-small-box($color--comet-dark, 0);
                    }

                    &[disabled] {
                        background: mix($color--green, grayscale($color--green));
                    }
                }

                &.orange {
                    background: $color--orange;
                    border-color: transparent;

                    &:before {
                        background: $gradient--orange-vertical;
                    }

                    &:after {
                        @include glow-small-box($color--orange, 0);
                    }

                    &[disabled] {
                        background: mix($color--orange, grayscale($color--orange));
                    }
                }

                &.red {
                    background: $color--red;
                    border-color: transparent;

                    &:before {
                        background: $gradient--red-vertical;
                    }

                    &:after {
                        @include glow-small-box($color--red, 0);
                    }

                    &[disabled] {
                        background: mix($color--red, grayscale($color--red));
                    }
                }
            }
        }

        &[disabled] {
            cursor: default;
        }
        */
    }
</style>
