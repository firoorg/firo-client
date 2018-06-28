<template>
    <div class="denomination">
        <div class="bar" :class="{ 'is-empty': !minted && !current }">
            <div class="current"
                 :class="{ 'has-current': current }"
                 :style="{ height: currentHeight }">
                <span v-show="current">{{ current }}</span>
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
    // import smoothHeight from 'vue-smooth-height'

    export default {
        name: 'Denomination',
        /*
        mixins: [
            smoothHeight
        ],
        */
        props: {
            denomination: {
                type: Number,
                required: true
            },
            availableBalance: {
                type: Number,
                default: 100
            }
        },

        data () {
            return {
                current: 0
            }
        },

        mounted () {
            /*
            this.$smoothElement({
                el: this.$refs.bar
            })
            */
        },

        computed: {
            ...mapGetters({
                denominations: 'Mint/denominations'
            }),

            canIncrease () {
                return this.current + this.denomination < this.availableBalance
            },

            canDecrease () {
                return this.current > 0
            },

            currentHeight () {
                return this.calcHeight(this.current) + 'px'
            },

            mintHeight () {
                return this.calcHeight(this.minted) + 'px'
            },

            minted () {
                return this.denominations[`${this.denomination}`] || Math.ceil(Math.random() * 10)
            }
        },

        methods: {
            calcHeight (amount) {
                return !amount ? 0 : Math.log((amount + 1)/* *  this.denomination */) * (8 * 4)
            },

            increase () {
                if (!this.canIncrease) {
                    return
                }
                console.log('increase')
                this.current++
            },

            decrease () {
                if (!this.canDecrease) {
                    return
                }
                console.log('decrease')
                this.current--
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
            background: none;
            border: none;
            @include font-heavy();
            cursor: pointer;
            color: $color--comet-dark;
            outline: none;

            &[disabled] {
                color: $color--comet;
                cursor: default;
            }

            &:not([disabled]) {
                &:hover {
                    color: $color--dark;
                }
            }
        }
    }
</style>