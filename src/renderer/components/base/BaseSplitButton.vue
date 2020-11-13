<template>
    <div class="split-button">
        <slot
            name="button"
            :button="$attrs"
        />
        <base-popover
            :open="false"
            placement="auto-end"
            popover-class="advice"
            :auto-hide="true"
        >
            <template slot="content">
                <slot name="flyout" />
            </template>
            <template slot="target">
                <base-button
                    v-bind="$attrs"
                    class="options-handle"
                >
                    ‹
                </base-button>
            </template>
        </base-popover>
    </div>
</template>

<script>
export default {
    name: 'BaseSplitButton',
    inheritAttrs: false
    /*
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
        */
}
</script>

<style lang="scss" scoped>
    .split-button {
        display: flex;

        align-items: stretch;

        button:first-child {
            padding-right: emRhythm(3);
            padding-left: emRhythm(3);
        }

        .popover .trigger,
        .popover .trigger button {
            height: 100%;
        }

        button.options-handle {
            margin-left: 0;
            padding: 0 emRhythm(1.5);
            border-left: none;

            span {
                display: inline-block;
                transform: rotate(-90deg);
                padding-bottom: emRhythm(0.5);
                //font-size: emRhythm(inherit);
            }
        }
    }
</style>
