<template>
    <div>
        <header>
            <h2>Select Fee</h2>
            <p>Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna</p>
        </header>

        <ul>
            <li v-for="(fee, key) in availableFees">
                <input type="radio"
                       v-model="currentFee"
                       :value="key"
                       :id="key">

                <label :for="key">
                    <span class="title">{{ fee.label }}</span>
                    <span class="amount">{{ fee.amount }}</span>
                </label>
            </li>
        </ul>

        <footer>
            <base-button :is-outline="true"
                         @click.prevent="emitCurrentFee">
                Select Fee
            </base-button>
        </footer>
    </div>
</template>

<script>
    export default {
        name: 'SendFeeSelection',
        props: {
            selectedFee: {
                type: String,
                default: 'fast'
            }
        },
        data () {
            return {
                currentFee: this.$props.selectedFee,
                availableFees: {
                    fast: {
                        label: 'Fast',
                        amount: 0.01
                    },
                    medium: {
                        label: 'Medium',
                        amount: 0.005
                    },
                    slow: {
                        label: 'Slow',
                        amount: 0.001
                    }
                }
            }
        },

        methods: {
            emitCurrentFee () {
                const current = this.availableFees[this.currentFee]

                this.$emit('onFeeSelect', {
                    ...current,
                    key: this.currentFee
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    ul {
        margin: emRhythm(2) 0;
        padding: 0;
        list-style-type: none;
        margin-bottom: emRhythm(3);
        grid-template-columns: repeat(3, 1fr);
        grid-column-gap: emRhythm(2);
        display: grid;
    }

    li {
        position: relative;
        //display: inline-block;
        //margin-right: emRhythm(2);
        color: $color--comet-medium;

        /*
        &:last-child {
            margin-right: 0;
        }
         */

        input {
            position: absolute;
            z-index: 1;
            visibility: hidden;

            &:checked + label {
                color: $color--white;
                background: rgba($color--dark, 0.7);
                border-color: $color--dark;
            }
        }

        label {
            position: relative;
            z-index: 2;
            cursor: pointer;
            text-align: center;
            background: rgba($color--white, 0.1);
            display: block;
            padding: emRhythm(1);
            box-sizing: border-box;
            border: 1px solid transparent;

            transition: color .25s ease-out, background-color .25s ease-out, border-color .25s ease-out;

            span {
                display: block;
            }

            &:hover {
                border: 1px solid rgba($color--dark, 0.6);
                background: rgba($color--dark, 0.2);
                color: $color--comet-light;
            }

            .title {
                //@include setType(4, $ms-up1);
                @include font-heavy();
            }
        }
    }

    footer {
        padding-top: emRhythm(2);
        text-align: center;
    }
</style>