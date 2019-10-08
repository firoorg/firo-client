<template>
    <div
        ref="el"
        class="denomination"
    >
        <div
            class="bar"
            :class="{ 'is-empty': !existingValue && !value }"
        >
            <div
                class="value"
                :class="{ 'has-value': !!value }"
                :style="{ height: currentHeight }"
            >
                <span v-if="value">
                    {{ value }}
                </span>
            </div>
            <div
                class="existing-value"
                :class="{'has-existing-value': !!existingValue}"
                :style="{height: existingHeight}"
            >
                <span v-if="existingValue">
                    {{ existingValue }}
                </span>
            </div>
            <label>{{ denomination }}</label>
        </div>
        <div class="buttons">
            <base-round-button
                :disabled="!canDecrease"
                @click="tryDecrease"
            >
                &minus;
            </base-round-button>
            <base-round-button
                :disabled="!canIncrease"
                @click="tryIncrease"
            >
                &plus;
            </base-round-button>
        </div>
    </div>
</template>

<script>
import { convertToSatoshi } from "#/lib/convert";

export default {
    name: 'Denomination',

    props: {
        denomination: {
            type: String,
            required: true
        },

        // This is the largest number of coins showing in any mint bar.
        maxValueInSelector: {
            type: Number,
            required: true
        },

        // The maximum height of a notch of the mint bar, in pixels.
        maxMintNotchHeight: {
            type: Number,
            default: 24
        },

        // Remaining balance available for minting (with fee for the next mint already subtracted) in satoshi.
        availableBalanceRemaining: {
            type: Number,
            required: true
        },

        // The parent component is responsible for updating this appropriately when we call increase() and decrease().
        value: {
            type: Number,
            required: true
        },

        // The number of mints we have of this denomination currently.
        existingValue: {
            type: Number,
            required: true
        },

        // Called with no arguments when the user requests an increase in the amount of coins of this denomination to mint.
        increase: {
            type: Function,
            required: true
        },

        // Inverse of increase().
        decrease: {
            type: Function,
            required: true
        },

        // increase and decrease buttons will be disabled if this is set.
        disabled: {
            type: Boolean,
            required: true
        }
    },

    data () {
        return {
            maxHeight: 0
        };
    },

    computed: {
        canIncrease() {
            // Relevant fees are already calculated by the parent component.
            return !this.disabled && convertToSatoshi(this.denomination) <= this.availableBalanceRemaining;
        },

        canDecrease() {
            return !this.disabled && this.value > 0;
        },

        currentHeight() {
            return this.value * this.notchHeight + 'px';
        },

        existingHeight() {
            return this.existingValue * this.notchHeight + 'px';
        },

        notchHeight() {
            // The height of each notch will adaptively change based on the maximum value in the selector, but will
            // never exceed maxNotchHeight.
            return Math.min(Math.max(this.maxHeight, 0) / this.maxValueInSelector, this.maxMintNotchHeight);
        },
    },

    mounted () {
        this.maxHeight = this.$refs.el.parentElement.clientHeight;
    },

    methods: {
        tryIncrease() {
            if (this.canIncrease) {
                this.increase();
            }
        },

        tryDecrease() {
            if (this.canDecrease) {
                this.decrease();
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    .denomination {
        flex-grow: 1;
        text-align: center;
    }

    .bar {
        position: relative;
        // border: 1px solid red;
        width: 70%;
        margin: 0 auto;
        border-bottom: 1px solid transparent;
        z-index: 1;

        &.is-empty {
            border-bottom-color: $color--polo-medium;
        }

        .minted, .value {
            opacity: 0;
            height: 0;
            overflow: hidden;

            span {
                position: absolute;
                top: 0;
                right: emRhythm(1);
                @include font-heavy();
                font-style: italic;
            }
        }

        .value, .existing-value {
            border: 1px dashed $color--comet;
            border-bottom: none;
            transition: height 0.25s ease-out, opacity 0.25s ease-out;

            &.has-value {
                opacity: 1;
            }

            span {
                position: absolute;
                right: emRhythm(1);
                @include font-regular();
                font-style: italic;
                color: $color--polo-dark;
            }
        }

        .value {
            background: rgba($color--polo-medium, 0.5);
        }

        .existing-value {
            background: $color--polo-medium;
        }

        .minted {
            @include glow-small-box($color--green);

            position: relative;
            opacity: 1;
            background: $gradient--green-bright;
            transition: height 0.25s ease-out, opacity 0.25s ease-out;

            &.has-minted {
                opacity: 1;
            }

            span {
                color: $color--white;
            }
        }

        label {
            @include font-black();
            @include setType(3, $ms-up3);

            position: absolute;
            bottom: -0.125rem;
            left: -0.65rem;
        }
    }

    .buttons {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: center;
        margin-top: emRhythm(1);
        user-select: none;

        button + button {
            margin-left: 0.25rem;
        }
    }
</style>
