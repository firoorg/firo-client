<template>
    <div class="denomination">
        <div class="bar" :class="{ 'is-empty': !minted && !current }">
            <div class="current"
                 :class="{ 'has-current': current }"
                 :style="{ height: currentHeight }">
                <!--<span v-show="current">{{ current }}</span>-->
            </div>
            <div class="minted"
                 :class="{ 'has-minted': minted }"
                 :style="{ height: mintHeight }">
                <transition name="fade">
                    <span v-show="minted">{{ minted }}</span>
                </transition>
            </div>
            <label>{{ denomination }}</label>
        </div>
        <div class="buttons">
            <button :disabled="!canDecrease" @click="decrease">&minus;</button>
            <button :disabled="!canIncrease" @click="increase">&plus;</button>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { convertToSatoshi } from '#/lib/convert'
    // import { addVuexModel } from '@/utils/store'
    import types from '~/types'

    export default {
        name: 'Denomination',
        props: {
            denomination: {
                type: Number,
                required: true
            },
            availableBalance: {
                type: Number,
                required: true
            },
            maxValue: {
                type: Number,
                required: true
            },
            maxHeight: {
                type: Number,
                required: true
            },
            onChange: {
                type: Function,
                default: () => {}
            }
        },

        data () {
            return {
            }
        },

        computed: {
            ...mapGetters({
                denominations: 'Mint/currentDenominations',
                mints: 'Mint/confirmedMintsPerDenomination'
            }),

            canIncrease () {
                // fees for this increase are already subtracted by the parent element
                return (this.current + 1) * convertToSatoshi(this.denomination) < this.availableBalance
            },

            canDecrease () {
                return this.current > 0
            },

            currentHeight () {
                // const all = this.calcHeight(this.current + this.minted)
                // console.log(this.current + this.minted, 'all', all, 'max', this.maxValue, 'height', this.mapHeight(all))
                // return all - this.calcHeight(this.minted) + 'px'
                // return this.mapHeight(all) + 'px'
                return this.calcHeight(this.current) * (8 * 3) + 'px'
            },

            mintHeight () {
                return (Math.log(this.calcHeight(this.minted + 1)) * (8 * 4)) + 'px'
                // return this.calcHeight(this.current + this.minted) - this.calcHeight(this.current) + 'px'
                // return (this.minted ? (Math.log(this.calcHeight(this.minted + 1)) + (8 * 3)) : 0) + 'px'
            },

            current () {
                return this.denominations[`${this.denomination}`] || 0
            },

            minted () {
                return this.mints[`${this.denomination}`] || 0 // Math.ceil(Math.random() * 10)
            }
        },

        methods: {
            mapHeight (amount) {
                const map = (value, low1, high1, low2, high2) => {
                    return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
                }

                return map(amount, 0, Math.log(this.maxValue + 1), 30, this.maxHeight)
            },

            calcHeight (amount) {
                /*

                */

                return !amount ? 0 : Math.ceil((amount)/* *  this.denomination */) // * (8 * 3)

                // return !amount ? 0 : Math.ceil(map(Math.log(amount + 1), 0, Math.log(this.maxValue + 1) || 1, 30, this.maxHeight))
                // return !amount ? 0 : Math.log(amount + 1)
            },

            increase () {
                if (!this.canIncrease) {
                    return
                }

                this.$store.dispatch(types.mint.ADD_DENOMINATION, this.denomination)
                this.onChange()
            },

            decrease () {
                if (!this.canDecrease) {
                    return
                }

                this.$store.dispatch(types.mint.REMOVE_DENOMINATION, this.denomination)
                this.onChange()
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

        .minted,
        .current {
            opacity: 0;
            height: 0;
            overflow: hidden;
        }

        .current {
            background: rgba($color--polo-medium, 0.5);
            border: 1px dashed $color--comet;
            border-bottom: none;
            transition: height 0.25s ease-out, opacity 0.25s ease-out;

            &.has-current {
                opacity: 1;
            }
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
                position: absolute;
                top: 0;
                right: emRhythm(1);
                @include font-heavy();
                font-style: italic;
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
        display: inline-block;
        margin-top: emRhythm(1);

        button {
            border: none;
            @include font-heavy();
            cursor: pointer;
            color: $color--comet-dark;
            outline: none;
            border-radius: 50%;
            background-color: rgba($color--polo-medium, 0);

            transition: color 0.15s ease-out, background-color 0.15s ease-out;

            &[disabled] {
                color: $color--comet;
                cursor: default;
            }

            &:not([disabled]) {
                &:hover {
                    color: $color--dark;
                    background-color: rgba($color--polo-medium, 0.7);
                }

                &:active {
                    background-color: rgba($color--polo-medium, 1);
                }
            }
        }
    }
</style>