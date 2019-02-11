<template>
    <div class="field">
        <label>{{ $t('settings.form.privacy.label__hold-in-zerocoin') }}</label>
        <span class="description">
            {{ $t('settings.form.privacy.description__hold-in-zerocoin') }}
        </span>

        <div class="control">
            <!--
            <div class="input">
                <div
                    :style="{ width: `${privatePercentage}%` }"
                    class="private-side"
                >
                    <base-popover
                        :open="true"
                        trigger="manual"
                        placement="top"
                        popover-class="overlay-popover notice green range-input range-input-dark-light"
                        :can-blur="false"
                        :delay="1000"
                        :popper-options="getPopperOptions()"
                    >
                        <template slot="content">
                            <span>{{ privatePercentage }}</span> | <span>{{ publicPercentage }}</span>
                        </template>
                        <template slot="target">
                            <div class="handle" />
                        </template>
                    </base-popover>
                </div>
                <input
                    v-model="privatePercentage"
                    type="range"
                    class="slider"
                    min="0"
                    max="100"
                    step="10"
                >
            </div>
            <div class="labels">
                <label>{{ $t('onboarding.set-private-amount.label__private') }}</label>
                <span>{{ $t('onboarding.set-private-amount.label__public') }}</span>
            </div>
            -->
            <div class="labels">
                <span>{{ $t('settings.form.privacy.label__hold-in-zerocoin--private') }}</span>
                <span>{{ $t('settings.form.privacy.label__hold-in-zerocoin--public') }}</span>
            </div>
            <vue-slider
                v-model="privatePercentage"
                :interval="10"
                :height="8"
                :dot-width="8"
                :dot-height="16"
                tooltip-dir="bottom"
                process-class="private"

                class="slider"
            >
                <div
                    slot="tooltip"
                    slot-scope="{ value }"
                    class="vue-slider-tooltip"
                >
                    <span>{{ value }}</span> | <span>{{ 100 - value }}</span>
                </div>
            </vue-slider>
        </div>
    </div>
</template>

<script>
import vueSlider from 'vue-slider-component'

import types from '~/types'
import { addVuexModel } from '@/utils/store'

export default {
    name: 'AmountToHoldInZerocoinSettings',
    components: {
        vueSlider
    },

    data () {
        return {
            // privatePercentage: 50,
            popper: null
        }
    },
    computed: {
        ...addVuexModel({
            name: 'privatePercentage',
            getter: 'Settings/percentageToHoldInZerocoin',
            action: types.settings.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN
        })
    }

    /*

    watch: {
        privatePercentage: {
            handler () {
                if (!this.popper) {
                    return
                }

                this.popper.instance.scheduleUpdate()
            }
        }
    },

    methods: {
        getPopperOptions () {
            return {
                onCreate: (instance) => {
                    this.popper = instance
                }
            }
        }
    }
    */
}
</script>

<style lang="scss" scoped>
    $color--private: $color--comet-dark;
    //$color--private-hover: $color--comet-dark-mixed;
    $color--private-text: $color--white;
    $color--public: $color--polo-medium;
    //$color--public-hover: mix($color--comet, $color--comet-medium);

    .control {
        margin-top: emRhythm(2);
        padding-bottom: emRhythm(8);
    }

    .slider {
        //padding: 0 !important;
        //@include bleed-h(1);
        margin-left: -4px;
        margin-right: -4px;
    }

    .slider /deep/ {
        .vue-slider,
        .vue-slider-process {
            border-radius: 0;
        }

        .vue-slider-dot-handle {
            border-radius: 0;
            background: $gradient--green-bright--diagonal;
            box-shadow: none;
        }

        .vue-slider {
            background: $color--public;
        }
        .private {
            background: $color--private;
        }

        .vue-slider-tooltip {
            @include glow-small-box();
            background: $color--green;
            border-color: $color--green;
            //border-width: 0;
            border-radius: 0;
            padding: emRhythm(1);

            span {
                display: inline-block;
                padding: 0 emRhythm(0.5, $silent: true);
                @include font-heavy();
            }

            span:first-child {
                color: $color--dark;
            }

            span:last-child {
                color: $color--white;
            }
        }

    }

    .labels {
        display: flex;
        justify-content: space-between;

        @include font-heavy();

        span:first-child {
            color: $color--comet-dark-mixed;
        }

        span:last-child {
            color: $color--comet;
        }
    }
    /*
    .labels {
        display: flex;
        justify-content: space-between;

        @include font-heavy();

        span,
        label {
            padding: emRhythm(0.25, $silent: true) emRhythm(1) emRhythm(0.5, $silent: true);
        }

        label {
            background: $color--private;
            color: $color--private-text;
        }

        span {
            background: $color--public;
        }
    }

    .input {
        position: relative;
        width: 100%;
        padding-top: emRhythm(2);
    }

    .private-side {
        //border: 1px solid red;
        height: emRhythm(1);
        position: absolute;
        pointer-events: none;
        background: $color--private;
        z-index: 2;

        display: flex;
        justify-content: flex-end;

        .handle {
            width: 0;
            height: emRhythm(2);
            margin-top: emRhythm(-0.5, $silent: true);
            margin-right: emRhythm(-0.5, $silent: true);
        }
    }

    .trigger {
        display: block;
        width: 100%;
    }

    input[type=range] {
        display: block;
        width: 100%;
        -webkit-appearance: none;
        background: transparent;

        &::-webkit-slider-thumb {
            -webkit-appearance: none;
        }

        &:focus {
            outline: none;
        }

        &::-webkit-slider-thumb {
            position: relative;
            -webkit-appearance: none;
            height: emRhythm(2);
            width: emRhythm(1);
            background: $color--green;
            cursor: pointer;
            margin-top: emRhythm(-0.5, $silent: true);

            z-index: 3;
        }

        &::-webkit-slider-runnable-track {
            width: 100%;
            height: 8.4px;
            cursor: pointer;
            background: $color--public;
        }
    }
    */
</style>
