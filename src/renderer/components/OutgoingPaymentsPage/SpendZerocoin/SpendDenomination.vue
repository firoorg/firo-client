<template>
    <div class="denomination">
        <div class="bar-wrap">
            <transition name="fade">
                <span v-show="available">
                    {{ currentLabel }}
                </span>
            </transition>
            <div
                class="bar"
                :class="{ 'is-empty': !available }"
                :style="{ width: availableWidth }"
            >
                <div
                    class="mint"
                    :class="{ 'is-available': available }"
                    :style="{ width: currentWidth }"
                />
            </div>
            <label>{{ denomination }}</label>
        </div>
        <div class="buttons">
            <button
                :disabled="!canDecrease"
                class="decrease"
                @click.stop.prevent="decrease"
            >
                &minus;
            </button>
            <button
                :disabled="!canIncrease"
                class="increase"
                @click.stop.prevent="increase"
            >
                &plus;
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SpendDenomination',
    props: {
        denomination: {
            type: Number,
            required: true
        },
        available: {
            type: Number,
            required: true
        },

        current: {
            type: Number,
            required: true
        }
    },

    computed: {
        availableWidth () {
            return (Math.log(this.calcWidth(this.available + 1)) * (8 * 4)) + 'px'
            // return this.calcHeight(this.current + this.minted) - this.calcHeight(this.current) + 'px'
            // return (this.minted ? (Math.log(this.calcHeight(this.minted + 1)) + (8 * 3)) : 0) + 'px'
        },

        currentWidth () {
            // const all = this.calcHeight(this.current + this.minted)
            // console.log(this.current + this.minted, 'all', all, 'max', this.maxValue, 'height', this.mapHeight(all))
            // return all - this.calcHeight(this.minted) + 'px'
            // return this.mapHeight(all) + 'px'
            console.log(this.available - this.current)
            return (Math.log(this.calcWidth(this.available + 1 - this.current)) * (8 * 4)) + 'px'
        },

        canIncrease () {
            // fees for this increase are already subtracted by the parent element
            return (this.current) < this.available
        },

        canDecrease () {
            return this.current > 0
        },

        currentLabel () {
            return this.available - this.current
        }
    },

    methods: {
        calcWidth (amount) {
            return !amount ? 0 : Math.ceil(amount)
        },

        onChange (val) {
            this.$emit('change', {
                [`${this.denomination}`]: this.current + val
            })
        },

        increase () {
            if (!this.canIncrease) {
                return
            }

            // this.$store.dispatch(types.mint.ADD_DENOMINATION, this.denomination)
            this.onChange(+1)
        },

        decrease () {
            if (!this.canDecrease) {
                return
            }

            // this.$store.dispatch(types.mint.REMOVE_DENOMINATION, this.denomination)
            this.onChange(-1)
        }
    }
}
</script>

<style lang="scss" scoped>
    $label-width: 7;

    .denomination {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        align-content: center;
        padding: emRhythm(1) 0;
        min-width: emRhythm(30);
    }

    .bar-wrap {
        position: relative;
        display: flex;
        align-items: center;

        //
        span {
            //position: absolute;
            top: 0;
            left: emRhythm(1);
            @include font-medium();
            font-style: italic;
            color: $color--comet;
            margin-right: emRhythm(1);
            padding-bottom: 0.125rem;
            min-width: emRhythm(5);
            text-align: right;
        }
    }

    .buttons {
        // border: 1px solid red;
        margin-left: emRhythm($label-width);
        padding-bottom: 0.25rem;
    }

    .bar {
        position: relative;
    // border: 1 px solid red;
        height: emRhythm(1);
        z-index: 1;
        background: $color--comet-dark;
        display: flex;
        flex-direction: row-reverse;

        .mint {
            @include glow-small-box($color--green);
            background: $gradient--green-bright;
            transition: width 0.25s ease-out, opacity 0.25s ease-out;

            position: relative;
            opacity: 1;
            height: 100%;
        }
    }

    label {
        @include font-black();
        @include setType(3, $ms-up3);

        position: absolute;
        bottom: 0.375rem;
        right: emRhythm($label-width, $ms-up3) * -1 + 0.3em;
        width: emRhythm($label-width, $ms-up3);

        z-index: 2;

        text-shadow: 0 emRhythm(0.25, $silent: true) emRhythm(2) rgba($color--dark, 0.5);
    }

    .buttons {
        position: relative;
        z-index: 2;
        //display: inline-block;
        //margin-top: emRhythm(1);

        button {
            border: none;
            @include font-heavy();
            cursor: pointer;
            outline: none;
            border-radius: 50%;
            background-color: rgba($color--dark, .65);

            transition: color 0.15s ease-out, background-color 0.15s ease-out;

            &.decrease {
                color: $color--red-bright;
            }

            &.increase{
                color: $color--green;
            }

            &[disabled] {
                background-color: rgba($color--dark, .35);
                color: $color--comet;
                cursor: default;
            }

            &:not([disabled]) {
                &:hover {
                    color: $color--dark;
                    &.decrease {
                        @include glow-small-box($color--red);
                        background: $gradient--red-vertical;
                    }

                    &.increase{
                        @include glow-small-box($color--green);
                        background: $gradient--green-bright;
                    }
                }

                &:active {
                    background-color: rgba($color--comet-light, 1);
                }
            }

            &+ button {
                margin-left: emRhythm(0.5, $silent: true);
            }
        }
    }
</style>