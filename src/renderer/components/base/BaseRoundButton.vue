<template>
    <div
        class="base-round-button"
        @click="$emit('click')"
        :class="[isDark ? 'dark' : '', color]"
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

        &.red {
            color: $color--red-bright;
        }

        &.green {
            color: $color--green;
        }

        &:not([disabled]) {
            &:hover {
                color: $color--dark;
                background-color: rgba($color--polo-medium, 0.7);

                &.dark {
                    background-color: $color--polo-light;
                }

                &.red {
                    @include glow-small-box($color--red);
                    background: $gradient--red-vertical;
                }

                &.green {
                    @include glow-small-box($color--green);
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
