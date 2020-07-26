<template>
    <ul class="mints">
        <li
            v-for="[denomination, amount] of Object.entries(currentMints)"
            v-if="amount > 0"
            :key="denomination"
        >
            <div class="amount">
                {{ amount }}&MediumSpace;x
            </div>
            <div class="label">
                <div>
                    <span class="name">
                        Mint {{ convertToCoin(denomination) }}
                    </span>
                    <span class="cost">
                        {{ convertToCoin(denomination * amount) }} <span class="unit">
                            xzc
                        </span>
                    </span>
                </div>
            </div>
        </li>
    </ul>
</template>

<script>
import {convertToCoin} from "#/lib/convert";

export default {
    name: 'CurrentMints',

    props: {
        currentMints: {
            type: Object,
            required: true
        },
        showProgress: {
            type: Boolean,
            default: true
        }
    },

    methods: {
        convertToCoin
    }
}
</script>

<style lang="scss" scoped>
    .mints {
        $amount-width: 2rem;
        $unit-width: 2rem;

        list-style: none;
        padding: 0;
        border-bottom-color: rgba($color--white, 0.5);
        border-bottom-style: solid;
        @include rhythmBorderBottom(1px, 1);
        margin: 0;
        padding-bottom: emRhythm(1);

        li {
            padding-top: emRhythm(1);
            padding-bottom: emRhythm(1);
            @include rhythmBorderTop(1px, 1);
            border-color: rgba($color--white, 0.3);
            border-top-style: dashed;
            @include font-medium();

            display: grid;
            grid-template-columns: $amount-width auto $unit-width;

            &:first-child {
                border: none;
            };

            .amount {
                font-style: italic;
                opacity: .8;
            }

            .label {
                // @include setType(2, $ms-up1);
                @include font-heavy();

                & > div {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;

                    & + div {
                        margin: emRhythm(1) 0 0;
                    }

                    .cost {
                        position: relative;
                        //color: $color--comet-medium;
                        @include font-medium();
                        opacity: .8;

                        .unit {
                            position: absolute;
                            //right: -$unit-width;
                            padding-left: 0.25rem;
                            top: 0;
                            font-weight: normal;
                            opacity: .55;
                        }
                    }

                    .item {
                        //display: table-cell;
                        flex-grow: 1;
                        background: $color--comet-light;
                        height: emRhythm(0.75, $silent: true);
                        margin-bottom: emRhythm(1.25, $silent: true);
                        margin-right: emRhythm(1);
                        transition: width 0.25s ease-out;

                        &:last-child {
                            margin-right: 0;
                        }
                    }
                }
            }

            .cost {
                align-self: end;
                text-align: right;
            }
        }
    }
</style>
