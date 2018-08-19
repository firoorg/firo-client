<template>
    <ul class="selected-mints-list" :class="{ 'is-open': isOpen }">
        <li v-for="denom in mints"
            v-if="denom.amount"
            :key="denom.denomination">
            <span class="amount">{{ denom.amount }}&MediumSpace;x</span>
            <span class="label">{{ denom.denomination }}</span>
        </li>
        <li v-show="!hasMints" class="placeholder">
            <span v-if="!isOpen">Click to select Mints</span>
            <span v-else>Select Mints</span>
        </li>
        <li class="hover placeholder" v-show="!isOpen && hasMints">
            <span>Click to edit Mints</span>
        </li>
    </ul>
</template>

<script>
    export default {
        name: 'SelectedMintsList',

        props: {
            mints: {
                type: Array,
                required: true
            },

            isOpen: {
                type: Boolean,
                required: true
            }
        },

        computed: {
            hasMints () {
                return this.mints.reduce((accumulator, current) => {
                    return !!current.cost || accumulator
                }, false)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .selected-mints-list {
        position: relative;
        display: flex;
        justify-content: flex-start;

        margin: 0 (emRhythm($input-bleed) * -1);
        padding:  emRhythm(1) 0 emRhythm(1) emRhythm(1.25, $silent: true);

        transition: background 0.25s ease-out;
        @include dark-input();

        &:hover,
        &:focus,
        &.is-open {
            //background: rgba($color--dark, 0.6);

            li.hover {
                opacity: 1;
            }

            .placeholder {
                @include dark-placeholder-hover();
            }
        }

        li {
            background: $color--comet-dark;
            list-style-type: none;
            // display: inline-block;
            padding: 0;
            display: block;

            span {
                display: inline-block;
            }

            .amount {
                @include font-medium();
                font-style: italic;
                color: $color--comet-light;
                padding: 0 emRhythm(0.5, $silent: true) 0 emRhythm(0.75, $silent: true);
            }

            .label {
                @include font-heavy();
                color: $color--dark;
                background: mix($color--green-bright, $color--green);
                padding: emRhythm(0.25, $silent: true) emRhythm(1);
            }

            &.placeholder {
                background: transparent;
                padding: emRhythm(0.25, $silent: true) emRhythm(0.75, $silent: true);

                @include dark-placeholder();
            }

            &:hover,
            &:focus {
                &.placeholder {
                    @include dark-placeholder-hover();
                }
            }

            &.hover {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                opacity: 0;
                transition: opacity 0.15s ease-out;

                &.placeholder {
                    padding: emRhythm(1.25, $silent: true) emRhythm(0.75, $silent: true);
                    background: rgba(mix($color--dark, $color--comet-dark, 55%), 0.85);
                    color: mix($color--comet, $color--comet-medium);

                    // @include dark-placeholder-hover();
                }
            }

            & + li {
                margin-left: emRhythm(1)
            }
        }
    }
</style>