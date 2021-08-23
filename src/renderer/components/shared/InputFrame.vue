<template>
    <div class="framed-input" :class="{'has-unit': unit}">
        <label>{{ label }}</label>
        <div class="frame">
            <slot />
            <div v-if="unit" class="unit">{{ unit }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "InputFrame",
    props: ['label', 'unit']
}
</script>

<style scoped lang="scss">
.framed-input {
    position: relative;
    height: 50px;

    label {
        position: absolute;
        left: 9px;
        font-size: 12px;
        letter-spacing: 0.4px;
        background-color: var(--color-background-sidebar);
        z-index: var(--z-input-frame-label);
        padding: {
            left: 5px;
            right: 5px;
        }
    }

    .frame {
        position: absolute;
        top: 6px;
        bottom: 0;
        right: 0;
        left: 0;

        height: 36px;
        border: {
            width: thin;
            style: solid;
            radius: 4px;
            color: var(--color-secondary-tag-background);
        }

        input {
            font-weight: bold;
            height: 100%;
            width: 100%;
            padding: {
                top: 11px;
                bottom: 11px;
                left: 14px;
                right: 14px;
            }
            color: inherit;
            background-color: inherit;
            border: none;
            outline: none;
        }

        .unit {
            @at-root .framed-input.has-unit input {
                width: 80% !important;
            }

            position: absolute;
            text-align: right;
            width: 20%;
            right: 14px;
            bottom: 10px;
        }
    }
}
</style>