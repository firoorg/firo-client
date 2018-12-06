<template>
    <div class="filter-input">
        <input
            type="text"
            v-bind="$attrs"
            :value="value"
            @input="$emit('input', $event.target.value)"
        >
        <transition
            name="fade"
            :duration="150"
        >
            <button
                v-show="hasValue"
                class="clear-me"
                @click="clear"
            >
                <span>&times;</span>
            </button>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'BaseFilterInput',
    inheritAttrs: false,
    props: [
        'value'
    ],

    computed: {
        hasValue () {
            return this.value && this.value.length
        }
    },

    methods: {
        clear () {
            this.$emit('input', null)
        }
    }
}
</script>

<style lang="scss" scoped>
    .filter-input {
        position: relative;
        display: inline-block;
    }

    input {
        border: none;
        width: 100%;
        box-sizing: border-box;

        @include lato-font('normal');
        @include setType(5);
        @include rhythmBorderBottom(1px, 0);

        padding: 0 emRhythm($input-bleed);
        background: $color--white-light;
        border-bottom-style: solid;
        border-bottom-color: $color--polo-medium;
        outline: none;
        transition: background 0.15s ease-out, border-color 0.15s ease-out;
        color: $color--comet-dark;

        &::placeholder {
            color: $color--comet;
            font-style: italic;
        }

        &:hover,
        &:focus {
            background-color: $color--white;
            border-bottom-color: $color--polo;
        }
    }

    .clear-me {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        padding: emRhythm(1) emRhythm(1.5, $silent: true) emRhythm(1) 0;

        border: none;
        background: transparent;
        outline: none;

        span {
            @include font-heavy();
            @include setType(2.5, $silent: true);
            display: block;
            // background: mix($color--polo-medium, $color--polo);
            background: mix($color--comet-light, $color--comet-medium);
            width: emRhythm(2.5, $silent: true);
            // height: emRhythm(3);
            color: $color--white;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.15s ease-out;

            &:hover {
                background: $color--comet;
            }
        }
    }
</style>
