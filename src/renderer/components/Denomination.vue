<template>
    <div class="denomination">
        <div class="bar" :class="{ 'is-empty': !minted && !current }">
            <div class="current" :style="{ height: currentHeight }">
                <span v-show="current">{{ current }}</span>
            </div>
            <div class="minted" :style="{ height: mintHeight }">
                <span v-show="minted">{{ minted }}</span>
            </div>
            <label>{{ denomination }}</label>
        </div>
        <div class="buttons">
            <button :disabled="!canDecrease" @click="decrease">-</button>
            <button :disabled="!canIncrease" @click="increase">+</button>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    export default {
        name: 'Denomination',
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
                console.log(this.denominations)
                return 5
            }
        },

        methods: {
            calcHeight (amount) {
                return !amount ? 0 : Math.log((amount + 1)/* *  this.denomination */) * 30
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

        &.is-empty {
            border-bottom-color: $color--polo-medium;

            .current,
            .minted {
                opacity: 0;
                height: 0;
            }
        }

        .current {
            background: rgba($color--polo-medium, 0.5);
            border: 1px dashed $color--comet;
            border-bottom: none;
            opacity: 1;
            transition: height 0.25s ease-out, opacity 0.25s ease-out;
        }

        .minted {
            opacity: 1;
            background: $gradient--green-bright;
            transition: height 0.25s ease-out, opacity 0.25s ease-out;
        }

        label {
            @include font-black();
            @include setType(3, $ms-up3);

            position: absolute;
            bottom: -0.25rem;
            left: -0.65rem;
        }
    }

    .buttons {
        display: inline-block;

        button {
            background: none;
            border: none;
            @include font-heavy();
        }
    }
</style>