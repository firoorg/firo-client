<template>
    <label
        class="checkbox"
        :class="[size, color, {'disabled': disabled, 'checked': checkable }]"
    >
        <div>
            <input
                v-model="checkable"
                class="input"
                type="checkbox"
                :disabled="disabled"
            >
            <span class="inner" />
        </div>
        <span class="label">
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
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    display: inline-block;
    position: relative;
    vertical-align: middle;
    display: flex;
    line-height: 1;
    align-items: baseline;

    &.disabled {
        cursor: default;
    }
}

.input {
    position: absolute;
    opacity: 0;
    left: -9999px;
}

.inner {
    display: inline-block;
    position: relative;
    top: 0.25rem;
    border: none;
    background: $color--polo-medium;
    border-radius: emRhythm(0.5);
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
    width: emRhythm(0.5);
    transition: transform .15s cubic-bezier(.71, -.46, .88, .6) .05s;
    transform-origin: center;
}

.checked .inner {
    background-color: $color--comet-dark;
}

.checked .inner:before {
    transform: rotate(45deg) scaleY(1);
}
.disabled .inner {
    //background-color: #eff2f7;
    //border-color: #d3dce6;
    cursor: not-allowed;
}

.disabled.checked .inner {
    background-color: #d3dce6;
    border-color: #d3dce6;
}

.label {
    white-space: normal;

    em, code {
    }

    code {
    }
}

.checkbox.large {
    align-items: center;

    .inner {
        width: emRhythm(3);
        height: emRhythm(3);
        margin-right: emRhythm(1.5);

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
    &.checked .inner {
        background: $color--green;
    }

    &.disabled .label {
        //opacity: 0.55;
    }

    &.checked.disabled .inner {
        background: lighten(desaturate($color--green, 55%), 30%);

        &:before {
            border-color: rgba($color--white, 0.75);
        }
    }
}
</style>
