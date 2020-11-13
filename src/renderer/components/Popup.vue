<template>
    <div id="popup">
        <div class="outer">
            <div class="inner">
                <div v-if="close" class="close-button-container">
                    <a href="#" @click="close()">
                        <CloseIcon />
                    </a>
                </div>

                <div id="inner-popup" :class="{'no-popup-margin': !margin, 'has-close-button': !!close}">
                    <slot class="content" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CloseIcon from "renderer/components/Icons/CloseIcon";

export default {
    name: "Popup",

    components: {
        CloseIcon
    },

    props: {
        margin: {
            type: Boolean,
            default: true
        },

        // close MUST NOT be given if margin is false.
        close: {
            type: Function,
            required: false
        }
    }
}
</script>

<style scoped lang="scss">
@import "src/renderer/styles/z";
@import "src/renderer/styles/colors";
@import "src/renderer/styles/sizes";
@import "src/renderer/styles/typography";

#popup {
    z-index: $z-popup;
    position: absolute;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    // Make #popup transparent. It will still steal clicks of all external elements.
    background-color: $color-popup-outside;

    display: flex;
    align-items: center;
    justify-content: center;

    .outer {
        box-sizing: border-box;

        .inner {
            position: relative;

            .close-button-container {
                position: absolute;
                width: fit-content;
                top: $size-tiny-space;
                right: $size-tiny-space;
            }

            #inner-popup {
                background-color: $color-popup-background;
                width: fit-content;
                box-shadow: 0 8px 8px rgba(0, 0, 0, 0.25);
                border-radius: 8px;

                &:not(.no-popup-margin) {
                    padding: $size-popup-margin;
                }
            }
        }
    }
}
</style>