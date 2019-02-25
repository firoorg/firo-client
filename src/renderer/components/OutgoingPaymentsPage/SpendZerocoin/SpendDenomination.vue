<template>
    <div class="denomination">
        <div class="bar-wrap">
            <span
                :class="{ 'is-visible' : available }"
                class="current-label"
            >
                {{ currentLabel }}
            </span>
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
            <base-round-button
                :disabled="!canDecrease"
                :is-dark="true"
                color="red"
                @click="decrease"
            >
                &minus;
            </base-round-button>
            <base-round-button
                :disabled="!canIncrease"
                :is-dark="true"
                color="green"
                @click="increase"
            >
                &plus;
            </base-round-button>
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
        },

        decreaseDisabled: {
            type: Boolean,
            default: false
        },

        increaseDisabled: {
            type: Boolean,
            default: false
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
            //console.log(this.available - this.current)
            return (Math.log(this.calcWidth(this.available + 1 - this.current)) * (8 * 4)) + 'px'
        },

        canIncrease () {
            if (this.increaseDisabled) {
                return false
            }

            // fees for this increase are already subtracted by the parent element
            return (this.current) < this.available
        },

        canDecrease () {
            if (this.decreaseDisabled) {
                return false
            }

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
        .current-label {
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
            opacity: 0;
            transition: opacity 0.25s ease-out;

            &.is-visible {
                opacity: 1
            }
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
        display: flex;
        //display: inline-block;
        //margin-top: emRhythm(1);

        /deep/ .base-round-button + .base-round-button {
            margin-left: emRhythm(0.5, $silent: true);
        }
    }
</style>
