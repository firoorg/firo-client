<template>
    <label
        class="checkbox"
        :class="[size, color]"
    >
        <div>
            <input
                v-model="checkable"
                class="input"
                type="checkbox"
                :disabled="disabled"
            >
            <span
                class="inner"
                :disabled="disabled"
                :checked="checkable"
            />
        </div>
        <span
            class="label"
            :disabled="disabled"
            :checked="checkable"
        >
            <slot
                :is-checked="checkable"
                :is-disabled="disabled"
            />
        </span>
    </label>
</template>

<script>
export default {
    name: 'Checkbox',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: ''
        },
        color: {
            type: String,
            default: 'comet'
        }
    },
    computed: {
        checkable: {
            get () {
                return this.value
            },
            set (value) {
                this.$emit('input', value)
            }
        }
    }
}
</script>

<style lang="scss" scoped>

.checkbox {
    //@include setType(3);
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    display: inline-block;
    position: relative;
    vertical-align: middle;
    display: flex;
    line-height: 1;
    align-items: baseline;
}

.input {
    position: absolute;
    opacity: 0;
    left: -9999px;
}

.inner {
    display: inline-block;
    position: relative;
    top: unitlessRhythm(1, $base-em-font-size) * 0.25rem;
    border: none;
    background: $color--polo-medium;
    border-radius: emRhythm(0.5, $silent: true);
    box-sizing: border-box;
    width: emRhythm(2);
    height: emRhythm(2);
    z-index: 1;
    transition: border-color .25s cubic-bezier(.71, -.46, .29, 1.46), background-color .25s cubic-bezier(.71, -.46, .29, 1.46);
    margin-right: emRhythm(1);
}

.inner:before {
    box-sizing: content-box;
    content: '';
    border: 2px solid $color--white;
    border-left: 0;
    border-top: 0;
    height: 8px;
    left: 5px;
    position: absolute;
    top: 1px;
    transform: rotate(45deg) scaleY(0);
    width: emRhythm(0.5, $silent: true);
    transition: transform .15s cubic-bezier(.71, -.46, .88, .6) .05s;
    transform-origin: center;
}

.inner[checked] {
    background-color: $color--comet-dark;
}

.inner[checked]:before {
    transform: rotate(45deg) scaleY(1);
}
.inner[disabled] {
    background-color: #eff2f7;
    border-color: #d3dce6;
    cursor: not-allowed;
}
.inner[disabled][checked] {
    background-color: #d3dce6;
    border-color: #d3dce6;
}

.label {
    @include setType(3);
    @include font-regular();
    white-space: normal;
}

.checkbox.large {
    align-items: center;

    .inner {
        width: emRhythm(3);
        height: emRhythm(3);
        margin-right: emRhythm(1.5, $silent: true);

        &:before {
            height: 8px * 1.5;
            left: 9px;
            top: 3px;
        }
    }

    .label {
        //margin-left: emRhythm(4);
    }
}

.checkbox.green {
    .inner[checked] {
        background: $color--green;
    }
}
</style>
