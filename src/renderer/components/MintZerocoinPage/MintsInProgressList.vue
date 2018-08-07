<template>
    <ul class="mints-in-progress" :class="{ monochrome: isMonochrome }">
        <li v-for="(value, key) in items" :key="key">
            <div class="label">
                <!--<slot v-bind="value" />-->
                <div>
                    <span class="name">Mint {{ value.denomination }}</span>
                    <span class="eta">eta here</span>
                </div>

                <div class="wrapper">
                    <div v-for="(confirmations, id) in value.tx" class="item" :key="id">
                        <span class="progress" :style="{ width: calcProcessInPercent(confirmations) + '%' }"></span>
                    </div>
                </div>
            </div>
        </li>
    </ul>
</template>

<script>
    import { convertToCoin } from '#/lib/convert'

    export default {
        name: 'MintsInProgressList',
        props: {
            mints: {
                type: Array,
                required: true
            },
            isMonochrome: {
                type: Boolean,
                default: false
            }
        },

        computed: {
            items () {
                let list = {}

                for (let mint of this.mints) {
                    const { amount, id, confirmations } = mint
                    const key = amount + ''

                    if (!list[key]) {
                        list[key] = {
                            denomination: parseInt(convertToCoin(amount)),
                            tx: {}
                        }
                    }

                    list[key] = {
                        ...list[key],
                        tx: {
                            ...list[key].tx,
                            [id]: confirmations
                        }
                    }
                }

                return list
            }
        },

        methods: {
            calcProcessInPercent (confirmations) {
                // todo get confirmations required from store
                return confirmations / 6 * 100
            }
        }
    }
</script>

<style lang="scss" scoped>
    .mints-in-progress {
        list-style: none;
        padding: 0;

        li {
            padding-bottom: emRhythm(1);

            .label {
                .name {
                    @include font-heavy();
                }

                .eta {
                    display: inline-block;
                    padding-left: emRhythm(1);
                    @include font-medium();
                    font-style: italic;
                    color: $color--comet;
                }
            }

            .wrapper {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                margin-top: emRhythm(1);

                .item {
                    //display: table-cell;
                    flex-grow: 1;
                    background: $color--comet-light;
                    height: emRhythm(0.75, $silent: true);
                    margin-bottom: emRhythm(1.25, $silent: true);
                    margin-right: emRhythm(1);
                    transition: width 0.25s ease-out;
                    box-sizing: border-box;

                    &:last-child {
                        margin-right: 0;
                    }

                    .progress {
                        display: block;
                        height: 100%;
                        background: $color--green;
                        transition: width 1s ease-out;
                        min-width: emRhythm(1);
                    }
                }
            }
        }

        &.monochrome li .wrapper {
            .item {
                background: rgba($color--dark, 0.3);
                // border: 1px solid $color--comet;

                .progress {
                    background: $color--comet-light;
                }
            }
        }
    }
</style>