<template>
    <ul
        class="mints-in-progress"
        :class="{ monochrome: isMonochrome }"
    >
        <li
            v-for="(value, key) in items"
            :key="key"
        >
            <div class="label">
                <!--<slot v-bind="value" />-->
                <div class="desc">
                    <span class="name">
                        Mint {{ value.denomination }}
                    </span>
                    <span class="eta">
                        <timeago
                            :datetime="value.eta"
                            :auto-update="30"
                        />&nbsp;(approximately)
                    </span>
                </div>

                <div class="wrapper">
                    <div
                        v-for="(confirmations, id) in value.tx"
                        :key="id"
                        class="item"
                    >
                        <span
                            class="progress"
                            :style="{ width: calcProcessInPercent(confirmations) + '%' }"
                        />
                    </div>
                </div>
            </div>
        </li>
    </ul>
</template>

<script>
import { mapGetters } from 'vuex'
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
        ...mapGetters({
            averageBlockTime: 'Blockchain/averageBlockTimeInMilliSeconds'
        }),

        items () {
            let list = {}
            const now = Date.now()

            for (let mint of this.mints) {
                const { amount, id, confirmations } = mint
                const eta = now + ((6 - confirmations) * this.averageBlockTime)
                const key = amount + '-' + eta

                if (!list[key]) {
                    list[key] = {
                        denomination: convertToCoin(amount),
                        eta: eta,
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
                .desc {
                    display: flex;
                    justify-content: space-between;
                }

                .name {
                    @include font-heavy();
                }

                .eta {
                    display: block;
                    padding-left: emRhythm(1);
                    @include font-regular();
                    font-style: italic;
                    color: $color--comet;
                    text-align: right;
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
                        min-width: emRhythm(0.5, $silent: true);
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
