<template>
    <div
        class="base-round-button"
        :class="[isDark ? 'dark' : '', {'is-active': isActive}, color, size]"
        @click="$emit('click')"
    >
        <span>
            <slot />
        </span>
    </div>
</template>

<script>
export default {
    name: 'BaseRoundButton',

    props: {
        isDark: {
            type: Boolean,
            default: false
        },

        color: {
            type: String,
            default: ''
        },

        size: {
            type: String,
            default: ''
        },

        isActive: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style lang="scss" scoped>
    div {
        border: none;
        @include font-heavy();
        cursor: pointer;
        color: $color--comet-dark;
        outline: none;
        border-radius: 50%;
        background-color: rgba($color--polo-medium, 0);
        position: relative;
        height: 1.5rem;
        width: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;

        transition: color 0.15s ease-out, background-color 0.15s ease-out;

        // sizes

        &.large {
            height: 2.5rem;
            width: 2.5rem;
            //background: $gradient--green-bright;
        }

        // dark mode

        &.dark {
            background-color: rgba($color--dark, .65);
            color: $color--comet-medium;
        }

        &[disabled] {
            color: $color--comet;
            cursor: default;

            &.dark {
                background-color: rgba($color--dark, .35);
                color: $color--comet;
            }
        }

        &.light {
            background-color: rgba($color--polo-medium, 0.7);
        }

        // colors

        &.red {
            color: $color--red-bright;
        }

        &.green {
            color: $color--green;
        }

        &:not([disabled]) {
            &.is-active,
            &:hover {
                color: $color--dark;
                background-color: rgba($color--polo-medium, 0.7);

                &.dark {
                    background-color: $color--polo-light;
                }

                &.light {
                    background-color: $color--comet-dark-mixed;
                }

                &.red {
                    &.dark {
                        @include glow-small-box($color--red);
                    }

                    background: $gradient--red-vertical;
                }

                &.green {
                    &.dark {
                        @include glow-small-box($color--green);
                    }

                    background: $gradient--green-bright;
                }
            }

            &:active {
                background-color: rgba($color--polo-medium, 1);

                &.dark {
                    background-color: rgba($color--comet-light, 1);
                }
            }
        }
    }
</style>
