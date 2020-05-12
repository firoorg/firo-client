<template>
    <div class="field">
        <label>{{ $t('settings.form.privacy.label__hold-in-zerocoin') }}</label>
        <span class="description">
            {{ $t('settings.form.privacy.description__hold-in-zerocoin') }}
        </span>

        <div class="control">
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

    computed: {
        ...addVuexModel({
            name: 'privatePercentage',
            getter: 'Settings/percentageToHoldInZerocoin',
            action: types.settings.SET_PERCENTAGE_TO_HOLD_IN_ZEROCOIN
        })
    }
}
</script>

<style lang="scss" scoped>
    $color--private: $color--comet-dark;
    $color--private-text: $color--white;
    $color--public: $color--polo-medium;

    .control {
        margin-top: emRhythm(2);
    }

    .slider {
        margin-left: -4px;
        margin-right: -4px;
    }

    .slider {
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
</style>
