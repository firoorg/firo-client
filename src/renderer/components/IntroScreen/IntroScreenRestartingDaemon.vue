<template>
    <div class="restarting">
        <template v-if="!isLocked">
            <div class="icon">
                <loading-bounce class="bounce" />
            </div>
            <main>
                <h2>{{ $t('onboarding.passphrase-daemon-restart.title') }}</h2>
                <p v-html="$t('onboarding.passphrase-daemon-restart.description')" />
            </main>
        </template>
        <template v-else>
            <div>
                <overlay-success
                    class="icon"
                    :on-animation-end="() => showNextButton = true"
                />
            </div>
            <main>
                <h2>{{ $t('onboarding.passphrase-daemon-restart-success.title') }}</h2>
                <p v-html="$t('onboarding.passphrase-daemon-restart-success.description')" />

                <!--
                <transition name="fade">
                    <footer v-show="showNextButton">
                        <base-button
                            color="green" @click="() => actions.next()">
                            Next
                        </base-button>
                    </footer>
                </transition>
                -->
            </main>
        </template>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

import GuideStepMixin from '@/mixins/GuideStepMixin'
import EventBusMixin from '@/mixins/EventBusMixin'

import LoadingBounce from '@/components/Icons/LoadingBounce'
import OverlaySuccess from '@/components/Icons/OverlaySuccess'

export default {
    name: 'IntroScreenRestartingDaemon',
    components: {
        OverlaySuccess,
        LoadingBounce
    },

    mixins: [
        GuideStepMixin,
        EventBusMixin
    ],

    data () {
        return {
            eventBusName: 'popover:intro',
            showNextButton: false
        }
    },

    computed: {
        ...mapGetters({
            isLocked: 'App/isLocked',
            isRestarting: 'App/isRestarting'
        })
    },

    watch: {
        showNextButton () {
            setTimeout(() => {
                this.actions.next()
            }, 5000)
        }
        /*showNextButton() {
            this.eventBus.$emit('reflow')
        }*/
    },

    methods: {
        isEnabled () {
            return !this.isLocked
        }
    }
}
</script>

<style lang="scss" scoped>
.restarting {
    display: flex;
    align-items: center;
    padding-bottom: emRhythm(1);

    main {
        margin-left: emRhythm(3);
    }

    h2 {
        margin: 0 0 emRhythm(2, $ms-up2);
    }

    p:last-of-type {
        margin-bottom: 0;
    }

    .icon {
        $dim: emRhythm(12);
        width: $dim;
        height: $dim;
    }

    .bounce {
        $dim: emRhythm(6);
        width: $dim;
        height: $dim;
        margin-top: emRhythm(3);
        margin-left: emRhythm(5);
    }

    footer {
        padding-top: emRhythm(3);
        text-align: right;
    }
}
</style>
