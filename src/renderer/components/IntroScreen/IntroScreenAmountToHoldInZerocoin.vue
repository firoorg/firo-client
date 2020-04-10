<template>
    <div ref="boundaries">
        <header>
            <h1 v-hmtl="$t('onboarding.set-private-amount.title')" />
            <p v-hmtl="$t('onboarding.set-private-amount.description')" />
        </header>

        <div>
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
                        :delay="1000"
                        :popper-options="getPopperOptions()"
                        :boundaries-element="$refs.boundaries"
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
        </div>
        <footer>
            <BaseButton
                color="green"
                @click="actions.next"
            >
                {{ $t('onboarding.set-private-amount.button__confirm-selection--primary') }}
            </BaseButton>
        </footer>
    </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import types from '~/types'
import GuideStepMixin from '@/mixins/GuideStepMixin'
import { addVuexModel } from '@/utils/store'

export default {
    name: 'IntroScreenAmountToHoldInZerocoin',
    mixins: [
        GuideStepMixin
    ],

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
        }),

        publicPercentage () {
            return 100 - this.privatePercentage
        }
    },

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
}
</script>

<style lang="scss" scoped>
    $color--private: $color--comet-dark;
    //$color--private-hover: $color--comet-dark-mixed;
    $color--private-text: $color--white;
    $color--public: $color--comet-medium;
    //$color--public-hover: mix($color--comet, $color--comet-medium);

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
</style>
