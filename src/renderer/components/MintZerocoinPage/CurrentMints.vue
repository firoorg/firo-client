<template>
    <ul class="mints">
        <li v-for="(value, key) in currentMints" :key="key">
            <div class="amount">
                {{ value.amount }}&MediumSpace;x
            </div>
            <div class="label">
                <!--<slot v-bind="value" />-->
                <div>
                    <span class="name">Mint {{ value.denomination }}</span>
                    <span class="cost">{{ value.cost }} <span class="unit">xzc</span></span>
                </div>

                <div class="wrapper">
                    <div v-for="item in value.amount" class="item"></div>
                </div>
            </div>
        </li>
    </ul>
</template>

<script>
    export default {
        name: 'CurrentMints',

        props: {
            currentMints: {
                type: Array,
                required: true
            }
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

        li {
            padding-top: emRhythm(1);
            @include rhythmBorderBottom(1px, 1);
            border-color: rgba($color--white, 0.3);
            border-bottom-style: dashed;
            @include font-medium();

            display: grid;
            grid-template-columns: $amount-width auto $unit-width;

            &:last-child {
                border: none;
                padding-bottom: emRhythm(1);
            };

            .amount {
                font-style: italic;
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
                        color: $color--comet-medium;
                        @include font-medium();

                        .unit {
                            position: absolute;
                            //right: -$unit-width;
                            padding-left: 0.25rem;
                            top: 0;
                            font-weight: normal;
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