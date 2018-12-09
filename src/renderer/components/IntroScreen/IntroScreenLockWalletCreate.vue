<template>
    <div ref="inner">
        <h1>{{ $t('onboarding.create-passphrase.title') }}</h1>
        <p v-html="$t('onboarding.create-passphrase.description')" />

        <div class="form">
            <base-popover
                :open="!!(hasFeedback && passphraseLength)"
                trigger="manually"
                :can-blur="false"
                :boundaries-element="this.$refs.inner"
                :popover-class="['notice', 'overlay-popover', { 'error': hasWarning }]"
                placement="top-start"
            >
                <div slot="content">
                    <span v-if="hasWarning">
                        {{ currentWarning }}
                    </span>
                    <ul
                        v-else-if="hasSuggestions"
                        class="content-list"
                    >
                        <li
                            v-for="(suggestion, index) of currentSuggestions"
                            :key="index"
                        >
                            {{ suggestion }}
                        </li>
                    </ul>
                </div>

                <template slot="target">
                    <div class="control passphrase">
                        <input
                            type="text"
                            :placeholder="$t('onboarding.create-passphrase.placeholder__enter-passphrase')"
                            @input="onInput"
                        >
                        <div class="prefix">
                            <transition name="fade">
                                <circular-badge
                                    v-show="passphraseLength"
                                    :content="passphraseLength"
                                />
                            </transition>
                        </div>
                        <!--
                        <div>
                            <base-button
                                v-if="!passphrase"
                                color="comet"
                            >
                                {{ $t('onboarding.create-passphrase.button__generate-passphrase--primary') }}
                            </base-button>
                        </div>
                        -->
                    </div>
                </template>
            </base-popover>

            <div
                class="scores"
                :class="currentScoreClass"
            >
                <div
                    v-for="index in maxScore"
                    :key="index"
                    :class="{ active: (index - 1) <= currentScore && passphraseLength }"
                >
                    <span />
                </div>
            </div>
        </div>

        <footer>
            <base-button
                color="green"
                :disabled="!isValidPassphrase"
                @click="goToConfirm"
            >
                {{ $t('onboarding.confirm-passphrase.button__confirm-passphrase--primary') }}
            </base-button>
        </footer>
    </div>
</template>

<script>
import CircularBadge from '@/components/Badge/CircularBadge'
import zxcvbn from 'zxcvbn'
import BasePopover from "../base/BasePopover";

export default {
    name: 'IntroScreenLockWalletCreate',
    components: {BasePopover, CircularBadge},
    props: {
        passphrase: {
            type: String,
            required: true
        },
        goToConfirm: {
            type: Function,
            required: true
        },
        scoreToReach: {
            type: Number,
            default: 3
        }
    },

    data () {
        return {
            isValidPassphrase: false,
            maxScore: 5,
            strength: {}
        }
    },

    computed: {
        passphraseLength () {
            return this.passphrase.length ? this.passphrase.length : ''
        },

        currentScore () {
            const { score = 0 } = this.strength

            return score
        },

        currentScoreClass () {
            return `score-${this.currentScore}`
        },

        currentWarning () {
            const { feedback = {} } = this.strength
            const { warning } = feedback

            return warning
        },

        hasWarning () {
            return !!(this.currentWarning && this.currentWarning.length)
        },

        currentSuggestions () {
            const { feedback = {} } = this.strength
            const { suggestions } = feedback

            return suggestions
        },

        hasSuggestions () {
            return !!(this.currentSuggestions && this.currentSuggestions.length)
        },

        hasFeedback () {
            return this.hasWarning || this.hasSuggestions
        }
    },

    watch: {
        passphrase: {
            handler () {
                this.calculateStrength()
            },
            immediate: true
        }
    },

    methods: {
        onInput(event) {
            const { value } = event.target
            this.$emit('update:passphrase', value)
        },

        calculateStrength() {
            console.log('calculateStrength')
            this.strength = {}

            if (this.passphraseLength) {
                this.strength = zxcvbn(this.passphrase, [])
            }

            this.isValidPassphrase = this.currentScore >= this.scoreToReach
            console.log('this.isValidPassphrase', this.isValidPassphrase)
        }
    }

}
</script>

<style lang="scss" scoped>
.form {
    margin-top: emRhythm(7);
    position: relative;

    & /deep/ .trigger {
        width: 100%;
    }

    ul {
        margin: 0;
    }

    .scores {
        display: flex;
        margin-top: 0.5rem;

        div {
            height: 0.25rem;
            background: $color--polo-light;
            flex-grow: 1;

            &.active span {
                width: 100%;
            }
        }

        span {
            display: block;
            width: 0;
            height: 100%;
            transition: background-color 0.25s ease-in, width 0.25s ease-in;
        }

        div + div {
            margin-left: 0.5rem;
        }

        &.score-0 .active span {
            background-color: $color--red-bright;
        }

        &.score-1 .active span {
            background-color: mix($color--red, $color--orange);
        }

        &.score-2 .active span {
            background-color: $color--orange;
        }

        &.score-3 .active span {
            background-color: mix($color--orange, $color--green, 35%);
        }

        &.score-4 .active span {
            background-color: mix($color--green, $color--green-bright, 50%);
        }
    }
}
</style>
